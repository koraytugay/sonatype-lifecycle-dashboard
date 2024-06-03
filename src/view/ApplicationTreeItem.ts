import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { ComponentTreeItem } from './ComponentTreeItem';

export class ApplicationTreeItem extends TreeItem {
  children: ComponentTreeItem[] | undefined;

  constructor(label: string, componentTreeItems: ComponentTreeItem[]) {
    super(label, TreeItemCollapsibleState.Expanded);
    this.children = componentTreeItems;
    this.iconPath = new ThemeIcon('folder');
  }
}
