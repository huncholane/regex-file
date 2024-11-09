import * as vscode from "vscode";

const BACKGROUND_COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#FF1493",
  "#4B0082",
  "#EE82EE",
  "#8A2BE2",
  "#5F9EA0",
  "#7FFF00",
  "#D2691E",
  "#FF7F50",
  "#6495ED",
  "#DC143C",
  "#00CED1",
  "#9400D3",
  "#FFD700",
  "#ADFF2F",
  "#FF69B4",
  "#CD5C5C",
  "#F0E68C",
  "#E6E6FA",
  "#7CFC00",
  "#20B2AA",
  "#87CEFA",
  "#778899",
  "#FF6347",
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
      ...options,
    });
  }
}

const decorationGenerator = new DecorationGenerator();
export default decorationGenerator;
