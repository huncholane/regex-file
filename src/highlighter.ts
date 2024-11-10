import * as vscode from "vscode";
import { output } from "./output";
import { getNonRegexEditors, getRegexEditor } from "./utils";
import { regexButtons } from "./regexButtons";
import decorationGenerator from "./decorationGenerator";
import { getConfig } from "./global";

type HighlightGroup = {
  decorations: vscode.DecorationOptions[];
  decorationType: vscode.TextEditorDecorationType;
};

class Highlighter {
  context: vscode.ExtensionContext | undefined;
  highlightGroups: { [key: string]: HighlightGroup } = {};
  forceStop = false;

  constructor() {}

  activate(context: vscode.ExtensionContext) {
    // output.log("Highlighter activated");
    this.context = context;
  }

  getDecorationTypes() {
    return Object.values(this.highlightGroups).map(
      (group) => group.decorationType
    );
  }

  reset() {
    output.clear();
    this.getDecorationTypes().forEach((decoration) => {
      decoration.dispose();
    });
    this.highlightGroups = {};
    decorationGenerator.reset();
  }

  clearRanges() {
    for (const key of Object.keys(this.highlightGroups)) {
      this.highlightGroups[key].decorations = [];
    }
  }

  updateOrCreateHighlightGroup(
    key: string,
    range: vscode.Range,
    options: vscode.DecorationRenderOptions = {}
  ) {
    const decoration = { range, hoverMessage: key };
    // output.log(`Highlighting ${key}`);
    const decorationType = decorationGenerator.generate(options);
    if (this.highlightGroups[key]) {
      this.highlightGroups[key].decorations.push(decoration);
    } else {
      this.highlightGroups[key] = {
        decorations: [decoration],
        decorationType: decorationType,
      };
    }
  }

  applyXFlag(regex: string) {
    return regex.replace(/(?<!\\)#.*$/gm, "").replace(/\s+/g, "");
  }

  matchOnEditor(regex: string, document: vscode.TextDocument) {
    this.forceStop = false;
    const flags = regexButtons.getFlagString();
    const timeout = getConfig().get("timeout") as number;
    const startTime = Date.now();
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
    let i = 0;
    const maxMatches = getConfig().get("maxMatches") as number;
    for (const match of matches) {
      if (
        i >= maxMatches ||
        Date.now() - startTime > timeout ||
        this.forceStop
      ) {
        this.forceStop = false;
        break;
      }
      if (match.index === undefined) {
        continue;
      }
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);
      this.updateOrCreateHighlightGroup("match", new vscode.Range(start, end), {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
      });

      for (const groupName in match.groups) {
        const anyMatch = match as any;
        if (
          anyMatch.indices &&
          anyMatch.indices.groups &&
          anyMatch.indices.groups[groupName]
        ) {
          const groupIndices = anyMatch.indices.groups[groupName];
          const start = document.positionAt(groupIndices[0]);
          const end = document.positionAt(groupIndices[1]);
          this.updateOrCreateHighlightGroup(
            groupName,
            new vscode.Range(start, end)
          );
        } else {
          // output.log(groupName);
        }
      }
      i++;
    }
    output.log(`Found ${i} matches`);
  }

  matchRegexGroups(document: vscode.TextDocument) {
    const re = /(?<=\()\?<.+?(?=\))/g;
    const matches = document.getText().matchAll(re);
    let i = 0;
    const maxMatches = getConfig().get("maxMatches") as number;
    for (const match of matches) {
      if (i >= maxMatches) {
        break;
      }
      if (match.index === undefined) {
        continue;
      }
      const start = document.positionAt(match.index);
      const end = document.positionAt(match.index + match[0].length);
      this.updateOrCreateHighlightGroup(match[0], new vscode.Range(start, end));
      i++;
    }
  }

  highlightMatches(editor: vscode.TextEditor) {
    for (const key of Object.keys(this.highlightGroups)) {
      const group = this.highlightGroups[key];
      editor.setDecorations(group.decorationType, group.decorations);
    }
  }

  run() {
    this.reset();
    const regexEditor = getRegexEditor();
    if (!regexEditor) {
      return;
    }
    this.matchRegexGroups(regexEditor.document);
    this.highlightMatches(regexEditor);
    this.clearRanges();
    const nonRegexEditors = getNonRegexEditors();
    output.log(`Highlighting ${nonRegexEditors.length} editors`);
    for (const editor of nonRegexEditors) {
      this.matchOnEditor(regexEditor.document.getText(), editor.document);
      this.highlightMatches(editor);
    }
  }

  dispose() {
    this.reset();
  }
}

export const highlighter = new Highlighter();
