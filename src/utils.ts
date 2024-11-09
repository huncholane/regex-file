import * as vscode from "vscode";

export function editorsContainRegexFile() {
  const editors = vscode.window.visibleTextEditors;
  return editors.some(
    (editor) =>
      editor.document.languageId === "regex" &&
      editor.document.uri.scheme === "file"
  );
}

export function getRegexEditor() {
  const editors = vscode.window.visibleTextEditors;
  return editors.find(
    (editor) =>
      editor.document.languageId === "regex" &&
      editor.document.uri.scheme === "file"
  );
}

export function getNonRegexEditors() {
  const editors = vscode.window.visibleTextEditors;
  return editors.filter(
    (editor) =>
      editor.document.languageId !== "regex" ||
      editor.document.uri.scheme !== "file"
  );
}
