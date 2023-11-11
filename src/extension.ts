import * as vscode from "vscode";

/* GLOBAL VARIABLES */
let outputChannel: vscode.OutputChannel;
let lastRegex = "";
let lastText = "";
let decorationType: vscode.TextEditorDecorationType | undefined;

/* TYPES */
interface InnerMapValue {
  state: "on" | "off";
  button: vscode.StatusBarItem;
}

const flagButtons: { [key: string]: InnerMapValue } = {};
const states: Record<"on" | "off", string> = {
  on: "$(check)",
  off: "$(x)",
};

function getConfigFlags(): string {
  const config = vscode.workspace.getConfiguration("regex-file");
  return config.get("flags") as string;
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

  // Perform your matching and highlighting logic here
  const matches: vscode.Range[] = [];
  let [flags, hasX] = getRegexFlags();
  if (hasX) {
    reText = reText.replace(/\s/g, "");
  }
  const pattern = new RegExp(reText, flags);
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(searchText))) {
    if (i > 1000) {
      outputChannel.appendLine("The pattern reached max recursion.");
      break;
    }
    const startPos = textEditor.document.positionAt(match.index);
    const endPos = textEditor.document.positionAt(
      match.index + match[0].length
    );
    const range = new vscode.Range(startPos, endPos);
    matches.push(range);
    i++;
  }

  // Create a decoration type if not already created
  if (!decorationType) {
    decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: "yellow",
      color: "black",
    });
  }

  // Apply the decorations to the editor
  textEditor.setDecorations(decorationType, matches);
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
