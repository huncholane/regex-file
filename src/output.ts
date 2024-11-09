import * as vscode from "vscode";

class Output {
  outputChannel: vscode.OutputChannel | undefined;

  activate() {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel("Regex File");
      this.show();
    }
  }

  show() {
    this.outputChannel?.show();
  }

  clear() {
    this.outputChannel?.clear();
  }

  dispose() {
    this.outputChannel?.dispose();
  }

  hide() {
    this.outputChannel?.hide();
  }

  log(message: string) {
    this.outputChannel?.appendLine(message);
    console.log(message);
  }

  deactivate() {
    this.hide();
    this.dispose();
  }
}

export const output = new Output();
