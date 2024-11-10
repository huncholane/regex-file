import * as vscode from "vscode";

const BACKGROUND_COLORS = [
  "rgba(255, 255, 255, 0.2)", // White (For outer group)
  "rgba(255, 99, 71, 0.5)", // Light Coral
  "rgba(255, 140, 0, 0.5)", // Dark Orange
  "rgba(255, 215, 0, 0.5)", // Gold
  "rgba(240, 230, 140, 0.5)", // Khaki
  "rgba(144, 238, 144, 0.5)", // Light Green
  "rgba(152, 251, 152, 0.5)", // Pale Green
  "rgba(60, 179, 113, 0.5)", // Medium Sea Green
  "rgba(135, 206, 250, 0.5)", // Light Sky Blue
  "rgba(173, 216, 230, 0.5)", // Light Blue
  "rgba(135, 206, 235, 0.5)", // Sky Blue
  "rgba(221, 160, 221, 0.5)", // Plum
  "rgba(216, 191, 216, 0.5)", // Thistle
  "rgba(240, 128, 128, 0.5)", // Light Salmon
  "rgba(245, 222, 179, 0.5)", // Wheat
  "rgba(255, 192, 203, 0.5)", // Pink
  "rgba(255, 182, 193, 0.5)", // Light Pink
  "rgba(238, 232, 170, 0.5)", // Pale Goldenrod
  "rgba(255, 228, 196, 0.5)", // Bisque
  "rgba(255, 218, 185, 0.5)", // Peach Puff
  "rgba(175, 238, 238, 0.5)", // Pale Turquoise
  "rgba(224, 255, 255, 0.5)", // Light Cyan
  "rgba(240, 255, 240, 0.5)", // Honeydew
  "rgba(250, 250, 210, 0.5)", // Light Goldenrod Yellow
  "rgba(245, 245, 220, 0.5)", // Beige
  "rgba(255, 250, 205, 0.5)", // Lemon Chiffon
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
          fontWeight: "900",
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
