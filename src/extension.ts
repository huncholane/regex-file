import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const flagButtons = createFlagButtons();
  context.subscriptions.push(flagButtons);

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    updateFlagButtons(editor.document);
  }

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      updateFlagButtons(editor.document);
    }
  });

  vscode.workspace.onDidChangeTextDocument((event) => {
    updateFlagButtons(event.document);
  });
}

function createFlagButtons(): vscode.Disposable {
  const buttons = ["g", "i", "m", "s", "u", "y"].map((flag) => {
    const button = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    button.text = `$(check) ${flag.toUpperCase()}`;
    button.tooltip = `Toggle ${flag} flag`;
    button.command = `extension.toggleFlag${flag.toUpperCase()}`;
    return button;
  });

  buttons.forEach((button) => button.show());

  const disposables = buttons.map((button) => {
    let cs = button.command! as string;
    return vscode.commands.registerCommand(button.command! as string, () => {
      toggleFlag(cs.slice(-1));
    });
  });

  return vscode.Disposable.from(...disposables);
}

function updateFlagButtons(document: vscode.TextDocument): void {
  const regexFlags = getRegexFlags(document);
  const flagButtons = ["g", "i", "m", "s", "u", "y"];

  // flagButtons.forEach((flag) => {
  //   const button = vscode.window.statusBarItems.find(
  //     (item) => item.command === `extension.toggleFlag${flag.toUpperCase()}`
  //   );
  //   if (button) {
  //     button.text = regexFlags.includes(flag)
  //       ? `$(check) ${flag.toUpperCase()}`
  //       : `$(x) ${flag.toUpperCase()}`;
  //   }
  // });
}

function getRegexFlags(document: vscode.TextDocument): string[] {
  const regex = /\/.+\/([gimuy]*)/;
  const match = regex.exec(document.getText());
  return match ? match[1].split("") : [];
}

function toggleFlag(flag: string): void {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const regex = /\/(.+)\/([gimuy]*)/;
    const selection = editor.selection;
    const range = new vscode.Range(selection.start, selection.end);
    const text = editor.document.getText(range);
    const match = regex.exec(text);
    if (match) {
      const flags = match[2].split("");
      const index = flags.indexOf(flag);
      if (index !== -1) {
        flags.splice(index, 1);
      } else {
        flags.push(flag);
      }
      const updatedText = `/${match[1]}/${flags.join("")}`;
      editor.edit((editBuilder) => {
        editBuilder.replace(range, updatedText);
      });
    }
  }
}

export function deactivate() {}
