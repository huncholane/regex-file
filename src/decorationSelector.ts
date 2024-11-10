import * as vscode from "vscode";

const BACKGROUND_COLORS = [
  "rgba(255, 255, 255, 0.2)", // White (For outer group)
  "rgba(255, 0, 0, 0.5)", // Red
  "rgba(0, 255, 0, 0.5)", // Lime
  "rgba(0, 0, 255, 0.5)", // Blue
  "rgba(255, 255, 0, 0.5)", // Yellow
  "rgba(255, 0, 255, 0.5)", // Magenta
  "rgba(0, 255, 255, 0.5)", // Cyan
  "rgba(255, 165, 0, 0.5)", // Orange
  "rgba(255, 20, 147, 0.5)", // Deep Pink
  "rgba(75, 0, 130, 0.5)", // Indigo
  "rgba(238, 130, 238, 0.5)", // Violet
  "rgba(138, 43, 226, 0.5)", // Blue Violet
  "rgba(95, 158, 160, 0.5)", // Cadet Blue
  "rgba(127, 255, 0, 0.5)", // Chartreuse
  "rgba(210, 105, 30, 0.5)", // Chocolate
  "rgba(255, 127, 80, 0.5)", // Coral
  "rgba(100, 149, 237, 0.5)", // Cornflower Blue
  "rgba(220, 20, 60, 0.5)", // Crimson
  "rgba(0, 206, 209, 0.5)", // Dark Turquoise
  "rgba(148, 0, 211, 0.5)", // Dark Violet
  "rgba(255, 215, 0, 0.5)", // Gold
  "rgba(173, 255, 47, 0.5)", // Green Yellow
  "rgba(255, 105, 180, 0.5)", // Hot Pink
  "rgba(205, 92, 92, 0.5)", // Indian Red
  "rgba(240, 230, 140, 0.5)", // Khaki
  "rgba(230, 230, 250, 0.5)", // Lavender
  "rgba(124, 252, 0, 0.5)", // Lawn Green
  "rgba(32, 178, 170, 0.5)", // Light Sea Green
  "rgba(135, 206, 250, 0.5)", // Light Sky Blue
  "rgba(255, 99, 71, 0.5)", // Tomato
  "rgba(50, 205, 50, 0.5)", // Lime Green
];

class DecorationSelector {
  decorations: vscode.TextEditorDecorationType[] = [];
  currentIndex = 0;

  constructor() {
    for (const color of BACKGROUND_COLORS) {
      this.decorations.push(
        vscode.window.createTextEditorDecorationType({
          backgroundColor: color,
          color: "black",
        })
      );
    }
  }

  reset() {
    this.currentIndex = 0;
    for (const decoration of this.decorations) {
    }
  }

  select() {
    const decoration = this.decorations[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.decorations.length;
    return decoration;
  }

  dispose() {
    for (const decoration of this.decorations) {
      decoration.dispose();
    }
  }
}

const decorationSelector = new DecorationSelector();
export default decorationSelector;
