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
}

function createFlagButtons(context: vscode.ExtensionContext): void {
  ["g", "i", "m", "s", "u", "y", "x"].forEach((flag) => {
    const button = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    button.text = `${states.on} ${flag.toUpperCase()}`;
    button.tooltip = `Toggle ${flag} flag`;
    button.command = `regex.toggleFlag${flag.toUpperCase()}`;
    button.show();
    flagButtons[flag] = {
      state: "on",
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

function getRegexFlags(document: vscode.TextDocument): string[] {
  const regex = /\/.+\/([gimuy]*)/;
  const match = regex.exec(document.getText());
  return match ? match[1].split("") : [];
}

const decorationType = vscode.window.createTextEditorDecorationType({
  backgroundColor: "yellow",
  color: "black",
});

const nonFocusedDecorations: vscode.DecorationOptions[] = [];

function highlightMatches(document: vscode.TextDocument): void {
  // Retrieve the active editor's document text
  const activeText = document.getText();

  // Iterate over all visible editors
  vscode.window.visibleTextEditors.forEach((editor) => {
    // Skip the active editor
    if (editor.document === document) {
      return;
    }

    // Clear existing decorations
    editor.setDecorations(decorationType, nonFocusedDecorations);

    // Retrieve the non-focused editor's document text
    const nonFocusedText = editor.document.getText();

    // Perform your matching and highlighting logic here
    const nonFocusedMatches = nonFocusedText.match(
      new RegExp(activeText, "gm")
    );
    if (nonFocusedMatches) {
      const nonFocusedDecorations = nonFocusedMatches.map((match) => {
        console.log(match);
        const startPos = editor.document.positionAt(
          nonFocusedText.indexOf(match)
        );
        const endPos = editor.document.positionAt(
          nonFocusedText.indexOf(match) + match.length
        );
        const range = new vscode.Range(startPos, endPos);
        return { range };
      });

      // Apply new decorations
      editor.setDecorations(decorationType, nonFocusedDecorations);
    }
  });
}

function toggleFlag(flag: string): void {
  const button = flagButtons[flag].button;
  const currentState = flagButtons[flag].state;
  const newState = currentState === "on" ? "off" : "on";

  flagButtons[flag].state = newState;
  button.text = `${states[newState]} ${flag.toUpperCase()}`;

  // Perform any additional logic based on the new state
}

export function deactivate() {}
