import * as vscode from "vscode";

export function editorsContainRegexFile() {
  const editors = vscode.window.visibleTextEditors;
  return editors.some(
    (editor) =>
      editor.document.languageId === "regex" &&
      editor.document.uri.scheme === "file"
  );
}
