import chalk from "chalk";
import * as vscode from "vscode";

type Level = "info" | "error" | "warning";

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

  log(message: string, level: Level = "info") {
    const dateString = new Date().toLocaleTimeString();
    const reset = "\x1b[0m";
    const blue = "\x1b[34m";
    const green = "\x1b[32m";
    const red = "\x1b[31m";
    const yellow = "\x1b[33m";
    const whiteBright = "\x1b[97m";

    let output = `[${dateString}] `;
    if (level === "info") {
      output += `[info] `;
    } else if (level === "error") {
      output += `[error] `;
    } else if (level === "warning") {
      output += `[warning] `;
    }
    output += `${message}`;

    // Log to console with colors
    let coloredOutput = `${blue}[${dateString}] ${reset}`;
    if (level === "info") {
      coloredOutput += `${green}[info] ${reset}`;
    } else if (level === "error") {
      coloredOutput += `${red}[error] ${reset}`;
    } else if (level === "warning") {
      coloredOutput += `${yellow}[warning] ${reset}`;
    }
    coloredOutput += `${whiteBright}${message}${reset}`;
    console.log(coloredOutput);

    // Log to VS Code output channel without colors
    this.outputChannel?.appendLine(message);
  }

  deactivate() {
    this.hide();
    this.dispose();
  }
}

export const output = new Output();
