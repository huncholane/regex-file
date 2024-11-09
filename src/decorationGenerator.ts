import * as vscode from "vscode";

const BACKGROUND_COLORS = [
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#FF1493", // Deep Pink
  "#4B0082", // Indigo
  "#EE82EE", // Violet
  "#8A2BE2", // Blue Violet
  "#5F9EA0", // Cadet Blue
  "#7FFF00", // Chartreuse
  "#D2691E", // Chocolate
  "#FF7F50", // Coral
  "#6495ED", // Cornflower Blue
  "#DC143C", // Crimson
  "#00CED1", // Dark Turquoise
  "#9400D3", // Dark Violet
  "#FFD700", // Gold
  "#ADFF2F", // Green Yellow
  "#FF69B4", // Hot Pink
  "#CD5C5C", // Indian Red
  "#F0E68C", // Khaki
  "#E6E6FA", // Lavender
  "#7CFC00", // Lawn Green
  "#20B2AA", // Light Sea Green
  "#87CEFA", // Light Sky Blue
  "#FF6347", // Tomato
  "#32CD32", // Lime Green
];

class DecorationGenerator {
  backgroundColors: string[];

  constructor() {
    this.backgroundColors = [...BACKGROUND_COLORS];
  }

  reset() {
    this.backgroundColors = [...BACKGROUND_COLORS];
  }

  getColor() {
    return this.backgroundColors.pop();
  }

  generate(options?: vscode.DecorationRenderOptions) {
    return vscode.window.createTextEditorDecorationType({
      backgroundColor: this.getColor(),
      color: "black",
      ...options,
    });
  }
}

const decorationGenerator = new DecorationGenerator();
export default decorationGenerator;
