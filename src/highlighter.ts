import * as vscode from "vscode";
import { output } from "./output";
import { getNonRegexEditors, getRegexEditor } from "./utils";
import { regexButtons } from "./regexButtons";
import decorationGenerator from "./decorationGenerator";
import { getConfig } from "./global";

type HighlightGroup = {
  ranges: vscode.Range[];
  decoration: vscode.TextEditorDecorationType;
};

class Highlighter {
  context: vscode.ExtensionContext | undefined;
  decorations: vscode.TextEditorDecorationType[] = [];

  constructor() {}

  activate(context: vscode.ExtensionContext) {
    // output.log("Highlighter activated");
    this.context = context;
  }

  reset() {
    // output.log("Resetting decorations");
    this.decorations.forEach((decoration) => {
      decoration.dispose();
    });
    this.decorations = [];
    decorationGenerator.reset();
    output.clear();
  }

  createDecoration(options: vscode.DecorationRenderOptions) {
    const decoration = decorationGenerator.generate(options);
    this.decorations.push(decoration);
    return decoration;
  }

  applyXFlag(regex: string) {
    return regex.replace(/(?<!\\)#.*$/gm, "").replace(/\s+/g, "");
  }

  getHighlightGroups(regex: string, document: vscode.TextDocument) {
    const flags = regexButtons.getFlagString();
    if (regexButtons.hasXFlag()) {
      regex = this.applyXFlag(regex);
    }
    try {
      new RegExp(regex, flags);
    } catch (err) {
      output.log(`Invalid regex: ${regex}`);
      return {};
    }
    const re = new RegExp(regex, flags);
    const matches = document.getText().matchAll(re);
    const highlightGroups: { [key: string]: HighlightGroup } = {
      outer: {
        ranges: [],
        decoration: this.createDecoration({
          fontStyle: "italic",
        }),
      },
    };
    let i = 0;
    const maxMatches = getConfig().get("maxMatches") as number;
    for (const match of matches) {
      if (i >= maxMatches) {
        break;
      }
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);
      if (highlightGroups["outer"].ranges) {
        highlightGroups["outer"].ranges.push(new vscode.Range(start, end));
      }
      i++;
    }
    output.log(`Found ${i} matches`);
    return highlightGroups;
  }

  highlightMatches(regexEditor: vscode.TextEditor, editor: vscode.TextEditor) {
    // output.log(`Highlighting matches in ${editor.document.fileName}`);
    const regex = regexEditor.document.getText();
    const highlightGroups = this.getHighlightGroups(regex, editor.document);
    for (const key of Object.keys(highlightGroups)) {
      const group = highlightGroups[key];
      editor.setDecorations(group.decoration, group.ranges);
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
