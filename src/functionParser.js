/* =========================
 * Function Parser
 * ========================= */

const { FunctionManager } = require("./functionManager.js");

class FunctionParser {
  constructor(existingManager) {
    this.inFunction = false;
    this.currentFunction = null;
    this.braceCount = 0;
    this.functionManager = existingManager || new FunctionManager();
  }

  startFunction(name, parameters) {
    if (this.inFunction) {
      throw new Error("Cannot define function inside another function, yaar!");
    }
    this.inFunction = true;
    this.currentFunction = { name, parameters, body: [] };
    this.braceCount = 0;
    console.log(`🫡 Function "${name}" define kar rahe hain...`);
  }

  addToFunctionBody(lineTokens) {
    if (!this.inFunction) throw new Error("Not inside a function definition!");
    this.currentFunction.body.push(lineTokens);
  }

  isParsingFunction() {
    return this.inFunction;
  }

  finishFunction(env) {
    if (!this.inFunction) throw new Error("Not inside a function definition!");
    const fn = this.currentFunction;
    this.functionManager.defineFunction(fn.name, fn.parameters, fn.body, env);
    this.inFunction = false;
    this.currentFunction = null;
    this.braceCount = 0;
    return fn;
  }

  handleBrace(lineText) {
    if (!this.inFunction) return false;
    const openBraces = (lineText.match(/\{/g) || []).length;
    const closeBraces = (lineText.match(/\}/g) || []).length;
    this.braceCount += openBraces - closeBraces;
    return this.braceCount <= 0;
  }

  getFunctionManager() {
    return this.functionManager;
  }
}

module.exports = { FunctionParser };
