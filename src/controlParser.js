/* =========================
 * Control Flow Parser
 * ========================= */

class ControlParser {
  constructor() {
    this.inBlock = false;
    this.current = null; // { kind, headerTokens, body: [] }
    this.braceCount = 0;
  }

  start(kind, headerTokens) {
    if (this.inBlock) throw new Error("Already capturing a block");
    this.inBlock = true;
    this.current = { kind, headerTokens, body: [] };
    this.braceCount = 0;
  }

  addLine(tokens) {
    if (!this.inBlock) throw new Error("Not inside a control block");
    this.current.body.push(tokens);
  }

  handleBrace(lineText) {
    if (!this.inBlock) return false;
    const openBraces = (lineText.match(/\{/g) || []).length;
    const closeBraces = (lineText.match(/\}/g) || []).length;
    this.braceCount += openBraces - closeBraces;
    return this.braceCount <= 0;
  }

  finish() {
    if (!this.inBlock) throw new Error("Not inside a control block");
    const blk = this.current;
    this.inBlock = false;
    this.current = null;
    this.braceCount = 0;
    return blk;
  }

  isCapturing() {
    return this.inBlock;
  }
}

module.exports = { ControlParser };
