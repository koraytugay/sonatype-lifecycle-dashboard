import { workspace } from 'vscode';

export async function getIqServerUrl(): Promise<string | undefined> {
  return workspace.getConfiguration('sonatypeLifecycleDashboard').get('iqServerUrl');
}

export async function getIqServerCredentials(): Promise<string | undefined> {
  return workspace.getConfiguration('sonatypeLifecycleDashboard').get('credentials');
}

export async function getApplicationPublicIds(): Promise<string[]> {
  const applicationPublicIds = workspace.getConfiguration('sonatypeLifecycleDashboard').get('applicationPublicIds') as string;
  const applicationPublicIdArray = applicationPublicIds.split(',');
  for (let i = 0; i < applicationPublicIdArray.length; i++) {
    applicationPublicIdArray[i] = applicationPublicIdArray[i].trim();
  }
  return applicationPublicIdArray.sort();
}
