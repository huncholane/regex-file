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
      if (editorsContainRegexFile()) {
        highlighter.run();
        regexButtons.show();
      } else {
        highlighter.reset();
        regexButtons.hide();
      }
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    if (editorsContainRegexFile() && event.document.uri.scheme === "file") {
      highlighter.run();
    }
  });
}

export function deactivate() {
  output.dispose();
  highlighter.dispose();
  regexButtons.dispose();
}
