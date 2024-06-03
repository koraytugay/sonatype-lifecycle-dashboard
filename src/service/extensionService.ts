import { ThemeColor } from 'vscode';
import { getApplicationInternalId, getMostRecentReportId, getPolicyThreatsJson, getHasRemediation } from './iqClient';
import { ComponentTreeItem } from '../view/ComponentTreeItem';
import { AaDatum, PolicyViolation, PolicyViolationResponseDto } from '../model/iqModel';

export async function getComponentTreeItems(applicationPublicId: string): Promise<ComponentTreeItem[]> {
  const componentTreeItems: ComponentTreeItem[] = [];

  const appInternalId = await getApplicationInternalId(applicationPublicId);
  const reportId = await getMostRecentReportId(appInternalId);
  const policyThreats = await getPolicyThreatsJson(applicationPublicId, reportId);

  filterComponents(policyThreats);
  for (const aaDatum of policyThreats.aaData) {
    convertLegacyViolationsToWaivedViolations(aaDatum);
  }
  sortComponents(policyThreats);

  for (const aaDatum of policyThreats.aaData) {
    const hasRemediation = await getHasRemediation(appInternalId, aaDatum.componentIdentifier);
    const componentTreeItem = new ComponentTreeItem(aaDatum, applicationPublicId, reportId, hasRemediation);
    componentTreeItems.push(componentTreeItem);
  }

  return componentTreeItems;
}

export function filterComponents(policyResponseDto: PolicyViolationResponseDto) {
  const filteredData: AaDatum[] = [];

  for (const aaDatum of policyResponseDto.aaData) {
    aaDatum.allViolations = aaDatum.allViolations.filter((value) => value.policyThreatCategory === 'SECURITY');
    aaDatum.activeViolations = aaDatum.activeViolations.filter((value) => value.policyThreatCategory === 'SECURITY');
    aaDatum.waivedViolations = aaDatum.waivedViolations.filter((value) => value.policyThreatCategory === 'SECURITY');

    if (aaDatum.allViolations.length > 0) {
      filteredData.push(aaDatum);
    }
  }

  policyResponseDto.aaData = filteredData;
}

export function sortComponents(policyResponseDto: PolicyViolationResponseDto) {
  policyResponseDto.aaData.sort((a, b) => {
    return getComponentName(a)
      .concat(getComponentVersion(a))
      .localeCompare(getComponentName(b).concat(getComponentVersion(b)));
  });
}

export function convertLegacyViolationsToWaivedViolations(aaDatum: AaDatum) {
  const activeViolations: PolicyViolation[] = [];

  for (const activeViolation of aaDatum.activeViolations) {
    if (activeViolation.legacyViolation && !activeViolation.waived) {
      aaDatum.waivedViolations.push(activeViolation);
    } else {
      activeViolations.push(activeViolation);
    }
  }

  aaDatum.activeViolations = activeViolations;
}

export function getComponentName(aaDatum: AaDatum): string {
  const coordinates = aaDatum.componentIdentifier.coordinates;
  if (aaDatum.componentIdentifier.format === 'npm') {
    return coordinates['packageId'];
  }

  if (aaDatum.componentIdentifier.format === 'maven') {
    return coordinates['artifactId'];
  }

  return coordinates['name'];
}

export function getComponentVersion(aaDatum: AaDatum): string {
  return aaDatum.componentIdentifier.coordinates.version;
}

export function getThemeColor(aaDatum: AaDatum) {
  const highestActivePolicyThreatLevel = getHighestActivePolicyThreatLevel(aaDatum);

  if (aaDatum.activeViolations.length > 0) {
    if (highestActivePolicyThreatLevel >= 8) {
      return new ThemeColor('severity.critical');
    }

    if (highestActivePolicyThreatLevel >= 4) {
      return new ThemeColor('severity.severe');
    }

    if (highestActivePolicyThreatLevel >= 2) {
      return new ThemeColor('severity.moderate');
    }

    if (highestActivePolicyThreatLevel === 1) {
      return new ThemeColor('severity.low');
    }

    if (highestActivePolicyThreatLevel === 0) {
      return new ThemeColor('severity.none');
    }
  }

  if (aaDatum.waivedViolations.length > 0) {
    return new ThemeColor('severity.waived');
  }

  return new ThemeColor('severity.unspecified');
}

export function getHighestActivePolicyThreatLevel(aaDatum: AaDatum): number {
  let highestActivePolicyThreatLevel = 0;

  for (const activeViolation of aaDatum.activeViolations) {
    if (activeViolation.policyThreatLevel > highestActivePolicyThreatLevel) {
      highestActivePolicyThreatLevel = activeViolation.policyThreatLevel;
    }
  }

  return highestActivePolicyThreatLevel;
}
