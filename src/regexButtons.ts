import * as vscode from "vscode";
import { getConfig } from "./global";
import { output } from "./output";
import { highlighter } from "./highlighter";

type FlagChar = "g" | "i" | "m" | "s" | "u" | "y" | "x";
type FlagState = "on" | "off";
type FlagDict = { [key in FlagChar]: Flag };
type Flag = {
  char: FlagChar;
  tooltip: string;
  button?: vscode.StatusBarItem;
  state?: FlagState;
};

const FLAG_ICONS = {
  on: "$(check)",
  off: "$(x)",
};

const FLAG_COLORS = {
  on: "#00FF00",
  off: "#FF0000",
};

const FLAG_CHARS: Flag[] = [
  { char: "g", tooltip: "Global search: find all matches in the string" },
  {
    char: "i",
    tooltip:
      "Case-insensitive search: match both uppercase and lowercase characters",
  },
  {
    char: "m",
    tooltip: "Multi-line search: ^ and $ match the start and end of each line",
  },
  { char: "s", tooltip: "Dot matches newline: . matches newline characters" },
  { char: "u", tooltip: "Unicode: enable full Unicode matching" },
  {
    char: "y",
    tooltip:
      "Sticky search: start at the last index where the previous match ended",
  },
  {
    char: "x",
    tooltip:
      "Extended: allow whitespace and comments within the pattern (non-standard in JavaScript)",
  },
];

class RegexButtons {
  context: vscode.ExtensionContext | undefined;
  flags: FlagDict;

  constructor() {
    this.flags = FLAG_CHARS.reduce((acc, flag) => {
      flag.state = "off";
      acc[flag.char] = flag;
      return acc;
    }, {} as { [key in FlagChar]: Flag });
  }

  activate(context: vscode.ExtensionContext) {
    this.loadConfigFlags();
    this.context = context;
    this.createButtons();
  }

  getFlagString() {
    return Object.entries(this.flags)
      .filter(([_, flag]) => flag.state === "on")
      .map(([key, _]) => key)
      .join("")
      .replace("x", "")
      .replace("y", "")
      .concat("d");
  }

  hasXFlag() {
    return this.flags.x.state === "on";
  }

  hasYFlag() {
    return this.flags.y.state === "on";
  }

  loadConfigFlags() {
    for (const flag of getConfig().get("flags") as FlagChar[]) {
      this.flags[flag].state = "on";
    }
  }

  toggleFlag(flag: Flag) {
    // output.log(`Toggling flag ${flag.char}`);
    flag.state = flag.state === "on" ? "off" : "on";
    this.decorateFlag(flag);
    highlighter.run();
  }

  decorateFlag(flag: Flag) {
    if (flag.button && flag.state) {
      flag.button.text = `${FLAG_ICONS[flag.state]} ${flag.char.toUpperCase()}`;
      flag.button.color = FLAG_COLORS[flag.state];
      flag.button.tooltip = flag.tooltip;
    }
  }

  createButton(flag: Flag) {
    // output.log(`Creating button for ${flag}`);
    flag.button = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.decorateFlag(flag);
    flag.button.command = `regex.toggleFlag${flag.char.toUpperCase()}`;
    let disposable = vscode.commands.registerCommand(
      `regex.toggleFlag${flag.char.toUpperCase()}`,
      () => {
        this.toggleFlag(flag);
      }
    );
    flag.button.show();
    this.context?.subscriptions.push(flag.button);
    this.context?.subscriptions.push(disposable);
  }

  createButtons() {
    // output.log("Creating buttons");
    for (const flag of FLAG_CHARS) {
      this.createButton(flag);
    }
  }

  disposeButtons() {
    // output.log("Disposing buttons");
    for (const flag of Object.values(this.flags)) {
      if (flag.button) {
        flag.button.dispose();
      }
    }
  }

  hideButtons() {
    // output.log("Hiding buttons");
    for (const flag of Object.values(this.flags)) {
      if (flag.button) {
        flag.button.hide();
      }
    }
  }

  hide() {
    this.hideButtons();
  }

  showFlagButtons() {
    // output.log("Showing buttons");
    for (const flag of Object.values(this.flags)) {
      if (flag.button) {
        flag.button.show();
      }
    }
  }

  show() {
    this.showFlagButtons();
  }

  dispose() {
    this.disposeButtons();
  }
}

export const regexButtons = new RegexButtons();
