import * as vscode from 'vscode';
import { getComponentTreeItems } from './service/extensionService';
import { getApplicationPublicIds, getIqServerUrl } from './service/configurationService';
import { DashboardTreeViewProvider } from './view/DashboardTreeViewProvider';
import { ApplicationTreeItem } from './view/ApplicationTreeItem';
import { Uri, window } from 'vscode';

let isRunning = false;

export function activate(context: vscode.ExtensionContext) {
  let disposable;

  const treeViewProvider = new DashboardTreeViewProvider();
  disposable = window.createTreeView('lifecycle-dashboard-container-id', {
    treeDataProvider: treeViewProvider,
  });
  context.subscriptions.push(disposable);

  const fetchDashboard = async () => {
    if (isRunning) {
      return;
    }
    isRunning = true;
    try {
      treeViewProvider.reset();
      for (const applicationPublicId of await getApplicationPublicIds()) {
        const componentTreeItems = await getComponentTreeItems(applicationPublicId);
        const applicationTreeItem = new ApplicationTreeItem(applicationPublicId, componentTreeItems);
        treeViewProvider.addApplicationTreeItem(applicationTreeItem);
        treeViewProvider.refreshView();
      }
    } finally {
      isRunning = false;
    }
  };

  disposable = vscode.commands.registerCommand('sonatype-lifecycle-dashboard.fetchReports', fetchDashboard);
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('open-component-details-in-iq-server', ({ applicationPublicId, reportId, hash }) => {
    getIqServerUrl().then((iqServerUrl) => {
      const uri = Uri.parse(
        `${iqServerUrl}/assets/index.html#/applicationReport/${applicationPublicId}/${reportId}/componentDetails/${hash}/overview`
      );
      vscode.env.openExternal(uri);
    });
  });
  context.subscriptions.push(disposable);

  fetchDashboard();
}

export function deactivate() {}
