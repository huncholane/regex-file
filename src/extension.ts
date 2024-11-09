import * as vscode from "vscode";
import { output } from "./output";

export function activate(context: vscode.ExtensionContext) {
  output.activate();
  output.log("Starting File Regex extension");
}

export function deactivate() {}
