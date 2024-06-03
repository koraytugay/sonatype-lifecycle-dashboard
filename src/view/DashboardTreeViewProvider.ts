import { Event, EventEmitter, ProviderResult, TreeDataProvider } from 'vscode';
import { ComponentTreeItem } from './ComponentTreeItem';
import { ApplicationTreeItem } from './ApplicationTreeItem';

export class DashboardTreeViewProvider implements TreeDataProvider<ApplicationTreeItem | ComponentTreeItem> {
  data: ApplicationTreeItem[] = [];

  _onDidChangeTreeData: EventEmitter<undefined> = new EventEmitter<undefined>();

  onDidChangeTreeData: Event<undefined> = this._onDidChangeTreeData.event;

  getChildren(element?: ApplicationTreeItem | ComponentTreeItem): ProviderResult<ApplicationTreeItem[] | ComponentTreeItem[]> {
    if (!element) {
      return this.data;
    }

    if (element instanceof ApplicationTreeItem) {
      return element.children;
    }

    return undefined;
  }

  getTreeItem(element: ApplicationTreeItem): ApplicationTreeItem | Thenable<ApplicationTreeItem> {
    return element;
  }

  refreshView() {
    this._onDidChangeTreeData.fire(undefined);
  }

  addApplicationTreeItem(applicationTreeItem: ApplicationTreeItem) {
    this.data.push(applicationTreeItem);
  }

  reset() {
    this.data = [];
    this.refreshView();
  }

  getParent() {
    return undefined;
  }
}
