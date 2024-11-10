import * as vscode from "vscode";
import { output } from "./output";
import { editorsContainRegexFile } from "./utils";
import { regexButtons } from "./regexButtons";
import { highlighter } from "./highlighter";
import decorationSelector from "./decorationSelector";

export function activate(context: vscode.ExtensionContext) {
  output.activate();
  regexButtons.activate(context);
  highlighter.activate(context);

  if (editorsContainRegexFile()) {
    highlighter.run();
    regexButtons.show();
  }

  const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && editor.document.uri.scheme === "file") {
        if (editorsContainRegexFile()) {
          highlighter.run();
          regexButtons.show();
        } else {
          highlighter.reset();
          regexButtons.hide();
        }
      }
    }
  );

  const textDocumentListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (editorsContainRegexFile() && event.document.uri.scheme === "file") {
        highlighter.run();
      }
    }
  );

  context.subscriptions.push(activeEditorListener, textDocumentListener);
}

export function deactivate() {
  decorationSelector.dispose();
  highlighter.dispose();
  // console.log("Disposed highlighter");
  regexButtons.dispose();
  // console.log("Disposed regexButtons");
  output.dispose();
  // console.log("Disposed Output");
}
