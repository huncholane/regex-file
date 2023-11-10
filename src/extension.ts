import * as vscode from "vscode";

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

function checkForRegexFiles(): boolean {
  for (const editor of vscode.window.visibleTextEditors) {
    const filename = editor.document.fileName;
    if (!filename.endsWith(".re")) {
      deactivate();
    }
  }
  return false;
}

export function activate(context: vscode.ExtensionContext) {
  createFlagButtons(context);
  vscode.workspace.onDidChangeTextDocument(
    (event: vscode.TextDocumentChangeEvent) => {
      // Check if the changed document is the currently active editor
      if (
        vscode.window.activeTextEditor?.document === event.document &&
        vscode.workspace.textDocuments.length > 1
      ) {
        // Call your desired function here
        highlightMatches(vscode.window.activeTextEditor.document);
      }
    }
  );
  // vscode.window.onDidChangeActiveTextEditor(checkForRegexFiles);
  // vscode.window.onDidChangeWindowState(checkForRegexFiles);
  if (vscode.window.activeTextEditor) {
    highlightMatches(vscode.window.activeTextEditor.document);
  }
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

let decorationType: vscode.TextEditorDecorationType | undefined;

function highlightMatches(document: vscode.TextDocument): void {
  // Retrieve the active editor's document text
  let activeText = document.getText();

  // Iterate over all visible editors
  vscode.window.visibleTextEditors.forEach((editor) => {
    // Skip the active editor
    if (editor.document === document) {
      return;
    }
    if (decorationType) {
      editor.setDecorations(decorationType, []);
    }
    if (!activeText) {
      return;
    }

    // Retrieve the non-focused editor's document text
    let nonFocusedText = editor.document.getText();

    // Perform your matching and highlighting logic here
    const matches: vscode.Range[] = [];
    let [flags, hasX] = getRegexFlags();
    if (hasX) {
      activeText = activeText.replace(/\s/g, "");
    }
    const pattern = new RegExp(activeText, flags);
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(nonFocusedText))) {
      const startPos = editor.document.positionAt(match.index);
      const endPos = editor.document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      matches.push(range);
    }

    // Create a decoration type if not already created
    if (!decorationType) {
      decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "yellow",
        color: "black",
      });
    }

    // Apply the decorations to the editor
    editor.setDecorations(decorationType, matches);
  });
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
