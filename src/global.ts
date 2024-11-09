import * as vscode from "vscode";

export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("regex-file");
}

export function setConfig(key: string, value: any) {
  const config = getConfig();
  return config.update(key, value, true);
}
