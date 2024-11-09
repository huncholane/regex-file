import * as vscode from "vscode";
import { output } from "./output";
import { getNonRegexEditors, getRegexEditor } from "./utils";
import { regexButtons } from "./regexButtons";
import decorationGenerator from "./decorationGenerator";
import { getConfig } from "./global";

type HighlightGroup = {
  range: vscode.Range;
  decoration: vscode.TextEditorDecorationType;
};

class Highlighter {
  context: vscode.ExtensionContext | undefined;
  decorations: vscode.TextEditorDecorationType[] = [];

  constructor() {}

  activate(context: vscode.ExtensionContext) {
    output.log("Highlighter activated");
    this.context = context;
  }

  reset() {
    output.log("Resetting decorations");
    this.decorations.forEach((decoration) => {
      decoration.dispose();
    });
    this.decorations = [];
    decorationGenerator.reset();
  }

  getHighlightGroups(
    regex: string,
    flags: string,
    document: vscode.TextDocument
  ) {
    const re = new RegExp(regex, flags);
    const matches = document.getText().matchAll(re);
    const highlightGroups: HighlightGroup[] = [];
    const decorationMap: { [key: string]: vscode.TextEditorDecorationType } =
      {};
    const outerDecoration = decorationGenerator.generate({ cursor: "pointer" });
    this.decorations.push(outerDecoration);
    let i = 0;
    const maxMatches = getConfig().get("maxMatches") as number;
    for (const match of matches) {
      if (i >= maxMatches) {
        break;
      }
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);
      highlightGroups.push({
        range: new vscode.Range(start, end),
        decoration: outerDecoration,
      });
      i++;
    }
    return highlightGroups;
  }

  highlightMatches(regexEditor: vscode.TextEditor, editor: vscode.TextEditor) {
    output.log(`Highlighting matches in ${editor.document.fileName}`);
    const regex = regexEditor.document.getText();
    const flags = regexButtons.getFlagString();
    const highlightGroups = this.getHighlightGroups(
      regex,
      flags,
      editor.document
    );
    for (const group of highlightGroups) {
      editor.setDecorations(group.decoration, [group.range]);
    }
  }

  run() {
    this.reset();
    const regexEditor = getRegexEditor();
    if (!regexEditor) {
      return;
    }
    const nonRegexEditors = getNonRegexEditors();
    for (const editor of nonRegexEditors) {
      this.highlightMatches(regexEditor, editor);
    }
  }
}

export const highlighter = new Highlighter();
