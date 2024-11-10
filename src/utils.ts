import * as vscode from "vscode";
import { output } from "./output";

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
      editor.document.languageId !== "regex" &&
      editor.document.uri.scheme === "file"
  );
}

export function timeit(
  target: any,
  propertyKey: string,
  descriptor?: PropertyDescriptor
) {
  if (!descriptor) {
    console.error(
      "Descriptor is undefined. @timeit should be used on methods."
    );
    return;
  }
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const start = new Date().getTime();
    output.log("Starting " + propertyKey);
    const result = originalMethod.apply(this, args);
    output.log(`Executed ${propertyKey} in ${new Date().getTime() - start}ms`);
    return result;
  };
}
