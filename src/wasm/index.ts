import { output } from "../output";
import * as wasmImport from "./pkg/regex_processor";

class WASM {
  loaded = false;
  async default() {
    wasmImport
      .default()
      .then(() => {
        output.log("WASM loaded");
      })
      .catch((err) => {
        output.log(`Error loading WASM: ${err}`);
      });
  }

  runRegex(pattern: string, text: string) {
    return wasmImport.find_matches(pattern, text);
  }
}

export const wasm = new WASM();
