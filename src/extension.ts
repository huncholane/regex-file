import * as vscode from "vscode";
import { output } from "./output";
import { editorsContainRegexFile } from "./utils";
import { regexButtons } from "./regexButtons";

export function activate(context: vscode.ExtensionContext) {
  output.activate();
  regexButtons.activate(context);

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor.document.uri.scheme === "file") {
      if (editor.document.languageId === "regex") {
        output.log("Regex file opened");
      }
    }
    if (!editorsContainRegexFile()) {
      console.log("No regex file opened");
    }
  });
}

export function deactivate() {
  output.log("Stopping File Regex extension");
  output.deactivate();
}
