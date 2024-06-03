import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { AaDatum } from '../model/iqModel';
import { getComponentName, getComponentVersion, getThemeColor } from '../service/extensionService';

export class ComponentTreeItem extends TreeItem {
  constructor(aaDatum: AaDatum, applicationPublicId: string, reportId: string, hasRemediation: boolean) {
    super(getComponentName(aaDatum) + ' ' + getComponentVersion(aaDatum), TreeItemCollapsibleState.None);

    this.iconPath = new ThemeIcon('circle-filled', getThemeColor(aaDatum));

    if (hasRemediation) {
      this.description = ' - ⚠️';
    }

    this.command = {
      title: 'Open Component Details in IQ Server',
      command: 'open-component-details-in-iq-server',
      arguments: [
        {
          applicationPublicId,
          reportId,
          hash: aaDatum.hash,
        },
      ],
    };
  }
}
