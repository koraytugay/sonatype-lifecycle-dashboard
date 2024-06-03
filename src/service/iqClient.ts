import axios, { AxiosRequestConfig } from 'axios';
import { getIqServerCredentials, getIqServerUrl } from './configurationService';
import { ComponentIdentifier, PolicyViolationResponseDto } from '../model/iqModel';

export async function getApplicationInternalId(applicationPublicId: string): Promise<string> {
  const url = `${await getIqServerUrl()}/api/v2/applications?publicId=${applicationPublicId}`;
  const applicationInternalId = (await axios.get(url, await getAxiosConfig())).data['applications'][0]['id'];
  return applicationInternalId as string;
}

export async function getHasRemediation(applicationInternalId: string, componentIdentifier: ComponentIdentifier): Promise<boolean> {
  const url = `${await getIqServerUrl()}/api/v2/components/remediation/application/${applicationInternalId}?stageId=build`;
  const axiosResponse = await axios.post(url, JSON.stringify({ componentIdentifier: componentIdentifier }), await getAxiosConfig());

  const versionChanges: {
    data: { component: { componentIdentifier: { coordinates: { version: string } } } };
  }[] = axiosResponse.data['remediation']['versionChanges'];

  for (const versionChange of versionChanges) {
    if (versionChange.data.component.componentIdentifier.coordinates.version !== componentIdentifier.coordinates.version) {
      return true;
    }
  }

  return false;
}

export async function getMostRecentReportId(applicationInternalId: string) {
  const url = `${await getIqServerUrl()}/api/v2/reports/applications/${applicationInternalId}`;
  const data = (await axios.get(url, await getAxiosConfig())).data as [{ stage: string; reportHtmlUrl: string }];
  const mostRecentReportId = data.filter((val) => val['stage'] === 'build')[0]['reportHtmlUrl'].slice(-32);
  return mostRecentReportId;
}

export async function getPolicyThreatsJson(applicationPublicId: string, reportId: string): Promise<PolicyViolationResponseDto> {
  const csrfToken = (await getCsrfToken()) as string;
  const config = {
    ...(await getAxiosConfig()),
    headers: {
      'X-CSRF-TOKEN': csrfToken,
      Cookie: `CLM-CSRF-TOKEN=${csrfToken};`,
    },
  } as AxiosRequestConfig;

  const url = `${await getIqServerUrl()}/rest/report/${applicationPublicId}/${reportId}/browseReport/policythreats.json`;
  const policyViolationResponseDto: PolicyViolationResponseDto = (await axios.get(url, config)).data;

  return policyViolationResponseDto;
}

export async function getCsrfToken(): Promise<string> {
  const url = `${await getIqServerUrl()}/api/v2/userTokens/currentUser/hasToken`;
  const csrfTokenCookie = 'CLM-CSRF-TOKEN';
  const csrfToken = ((await axios.get(url, await getAxiosConfig())).headers['set-cookie'] as string[])
    .find((cookie) => cookie.includes(csrfTokenCookie))!
    .match(new RegExp(`^${csrfTokenCookie}=(.+?);`))?.[1];
  if (csrfToken) {
    return csrfToken;
  }
  return '';
}

async function getAxiosConfig(): Promise<AxiosRequestConfig> {
  const config: AxiosRequestConfig = {};
  config.headers = {
    'Content-Type': 'application/json',
  };

  const credentials = (await getIqServerCredentials()) as string;

  config.auth = {
    username: credentials.split(':')[0],
    password: credentials.split(':')[1],
  };

  return config;
}
