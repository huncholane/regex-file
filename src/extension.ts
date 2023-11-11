import * as vscode from "vscode";

/* GLOBAL CONSTANTS */
const baseEditorStyle = vscode.window.createTextEditorDecorationType({
  backgroundColor: "yellow",
  color: "black",
});

/* GLOBAL VARIABLES */
let textDecorations = [baseEditorStyle];
let outputChannel: vscode.OutputChannel;
let lastRegex = "";
let lastText = "";
let decorationType: vscode.TextEditorDecorationType | undefined;
const flagButtons: { [key: string]: InnerMapValue } = {};

/* TYPES */
type GroupMatches = {
  style: vscode.TextEditorDecorationType;
  matches: vscode.Range[];
};
type GroupMatchMap = {
  [key: string]: GroupMatches;
};
interface InnerMapValue {
  state: "on" | "off";
  button: vscode.StatusBarItem;
}
const states: Record<"on" | "off", string> = {
  on: "$(check)",
  off: "$(x)",
};

function getConfigFlags(): string {
  const config = vscode.workspace.getConfiguration("regex-file");
  return config.get("flags") as string;
}

function getRandomColor() {
  // Generate a random hex color
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getReEditor(): vscode.TextEditor | undefined {
  const editors = vscode.window.visibleTextEditors;

  for (const editor of editors) {
    const fileName = editor.document.fileName;
    if (fileName.endsWith(".re")) {
      return editor;
    }
  }
  console.log("No regex document.");
}

function getTextEditor(): vscode.TextEditor | undefined {
  const editors = vscode.window.visibleTextEditors;

  for (const editor of editors) {
    const fileName = editor.document.fileName;
    if (!fileName.endsWith(".re")) {
      return editor;
    }
  }
  console.log("No search document.");
}

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("regex-file");
  createFlagButtons(context);
  highlightMatches();
  vscode.window.onDidChangeVisibleTextEditors(highlightMatches);
  vscode.workspace.onDidChangeTextDocument(highlightMatches);
}

function createFlagButtons(context: vscode.ExtensionContext): void {
  ["g", "i", "m", "s", "u", "y", "x"].forEach((flag) => {
    const button = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    let state: "on" | "off" = "off";
    if (getConfigFlags().includes(flag)) {
      state = "on";
    }
    button.text = `${states[state]} ${flag.toUpperCase()}`;
    button.tooltip = `Toggle ${flag} flag`;
    button.command = `regex.toggleFlag${flag.toUpperCase()}`;
    button.show();
    flagButtons[flag] = {
      state,
      button,
    };
    let disposable = vscode.commands.registerCommand(
      `regex.toggleFlag${flag.toUpperCase()}`,
      () => {
        toggleFlag(flag);
      }
    );
    context.subscriptions.push(button);
    context.subscriptions.push(disposable);
  });
}

function getRegexFlags(): [string, boolean] {
  let flags = "";
  let hasX = false;
  Object.entries(flagButtons).forEach(([flag, info]) => {
    if (info.state === "on") {
      if (flag === "x") {
        hasX = true;
      } else {
        flags += flag;
      }
    }
  });
  return [flags, hasX];
}

function applyGroupMatchDecorations(
  editor: vscode.TextEditor,
  groupMatches: GroupMatchMap
) {
  for (const groupName of Object.keys(groupMatches)) {
    const { style, matches } = groupMatches[groupName];
    textDecorations.push(style);

    const decorations: vscode.DecorationOptions[] = matches.map((range) => ({
      range,
      hoverMessage: `Group: ${groupName}`,
    }));

    editor.setDecorations(style, decorations);
  }
}

function updateGroupMatches(
  textEditor: vscode.TextEditor,
  groupMatches: GroupMatchMap,
  match: RegExpExecArray
) {
  for (const groupName in match.groups) {
    const groupMatch = match.groups[groupName];

    if (groupMatch) {
      const startPos = textEditor.document.positionAt(
        match.index + match[0].indexOf(groupMatch)
      );
      const endPos = textEditor.document.positionAt(
        match.index + match[0].indexOf(groupMatch) + groupMatch.length
      );
      const matchRange = new vscode.Range(startPos, endPos);

      if (!groupMatches[groupName]) {
        // Generate a random color for the group
        const randomColor = getRandomColor();

        // Define a new TextEditorDecorationType for the group with the random color
        groupMatches[groupName] = {
          style: vscode.window.createTextEditorDecorationType({
            backgroundColor: randomColor,
            color: "black", // You can customize the text color
          }),
          matches: [matchRange],
        };
      } else {
        groupMatches[groupName].matches.push(matchRange);
      }
    }
  }
}

function highlightMatches(): void {
  const reEditor = getReEditor();
  const textEditor = getTextEditor();
  if (!reEditor || !textEditor) {
    outputChannel.appendLine(
      "Abort highlighting. Missing reEditor or textEditor."
    );
    return;
  }
  let reText = reEditor.document.getText();
  if (!reText) {
    outputChannel.appendLine("Abort highlighting. No text in the regex file.");
  }
  let searchText = textEditor.document.getText();
  if (searchText === lastText && reText === lastRegex) {
    return;
  }
  lastText = searchText;
  lastRegex = reText;
  outputChannel.appendLine("Ready to begin highlighting.");

  // Clear all previous text decorations
  for (const decoration of textDecorations) {
    textEditor.setDecorations(decoration, []);
    textDecorations = [baseEditorStyle];
  }

  // Perform your matching and highlighting logic here
  const matches: vscode.Range[] = [];
  let [flags, hasX] = getRegexFlags();
  if (hasX) {
    reText = reText.replace(/\s/g, "");
  }
  const pattern = new RegExp(reText, flags);
  const groupMatches: GroupMatchMap = {};
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(searchText))) {
    if (i > 1000) {
      outputChannel.appendLine("The pattern reached max recursion.");
      break;
    }
    updateGroupMatches(textEditor, groupMatches, match);
    const startPos = textEditor.document.positionAt(match.index);
    const endPos = textEditor.document.positionAt(
      match.index + match[0].length
    );
    const range = new vscode.Range(startPos, endPos);
    matches.push(range);
    i++;
  }

  // Apply base decorations
  textEditor.setDecorations(baseEditorStyle, matches);

  // Apply decorations to the groups
  applyGroupMatchDecorations(textEditor, groupMatches);
}

function toggleFlag(flag: string): void {
  const button = flagButtons[flag].button;
  const currentState = flagButtons[flag].state;
  const newState = currentState === "on" ? "off" : "on";

  flagButtons[flag].state = newState;
  button.text = `${states[newState]} ${flag.toUpperCase()}`;
}

export function deactivate() {
  disposeFlagButtons();
}

function disposeFlagButtons(): void {
  for (const key in flagButtons) {
    if (flagButtons.hasOwnProperty(key)) {
      const innerMapValue = flagButtons[key];
      innerMapValue.button.dispose();
    }
  }
  // Clear the flagButtons dictionary
  Object.keys(flagButtons).forEach((key) => delete flagButtons[key]);
}
