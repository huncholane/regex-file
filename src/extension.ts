import * as vscode from "vscode";
import { output } from "./output";
import { editorsContainRegexFile } from "./utils";
import { regexButtons } from "./regexButtons";
import { highlighter } from "./highlighter";

export function activate(context: vscode.ExtensionContext) {
  output.activate();
  regexButtons.activate(context);
  highlighter.activate(context);

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && editor.document.uri.scheme === "file") {
      if (editor.document.languageId === "regex") {
        output.log("Regex file opened");
        highlighter.run();
      }
    }
    if (!editorsContainRegexFile()) {
      console.log("No regex file opened");
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (editorsContainRegexFile() && event.document.uri.scheme === "file") {
      highlighter.run();
    }
  });
}

export function deactivate() {
  output.log("Stopping File Regex extension");
  output.deactivate();
}
