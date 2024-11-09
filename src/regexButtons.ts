import * as vscode from "vscode";
import { getConfig } from "./global";
import { output } from "./output";

const FLAG_CHARS = ["g", "i", "m", "s", "u", "y", "x"];

class RegexButtons {
  flagButtons: {
    [key: string]: {
      state: "on" | "off";
      button: vscode.StatusBarItem;
    };
  } = {};

  constructor() {}

  activate(context: vscode.ExtensionContext) {
    this.createButtons(context);
    this.updateFlagsFromConfig();
  }

  updateFlagsFromConfig() {
    output.log("Updating flags");
  }

  updateFlagsFromUI() {
    output.log("Updating flags from UI");
  }

  createButton(flag: string) {
    output.log(`Creating button for ${flag}`);
  }

  createButtons(context: vscode.ExtensionContext) {
    output.log("Creating buttons");
  }

  disposeButtons() {
    output.log("Disposing buttons");
  }

  dispose() {
    this.disposeButtons();
  }
}

export const regexButtons = new RegexButtons();
