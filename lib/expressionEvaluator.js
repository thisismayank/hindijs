const { variableResolver } = require("./variableResolver.js");

const expressionEvaluator = (tokens, env) => {
  let i = 0;

  const peek = () => tokens[i];
  const consume = () => tokens[i++];

  function parsePrimary() {
    const tok = consume();
    if (!tok) throw new SyntaxError("Unexpected end of expression");
    if (tok.type === "NUMBER") return tok.value;
    if (tok.type === "STRING") return tok.value;
    if (tok.type === "WORD") {
      const lower = tok.value.toLowerCase();
      if (lower === "sach") return true;
      if (lower === "jhoot") return false;
      if (lower === "khaali") return null;
      return variableResolver(env, tok.value);
    }
    if (tok.type === "LPAREN") {
      const val = parseExpression();
      if (peek()?.type !== "RPAREN") throw new SyntaxError(") expected");
      consume();
      return val;
    }
    if (tok.type === "LBRACK") {
      const elements = [];
      if (peek() && peek().type === "RBRACK") {
        consume();
        return elements;
      }
      while (true) {
        const el = parseExpression();
        elements.push(el);
        if (peek() && peek().type === "COMMA") {
          consume();
          continue;
        }
        if (peek() && peek().type === "RBRACK") {
          consume();
          break;
        }
        throw new SyntaxError("] expected in array literal");
      }
      return elements;
    }
    throw new SyntaxError("Bad primary expression");
  }

  function parsePostfix() {
    let value = parsePrimary();
    while (peek() && peek().type === "EXISTS") {
      consume();
      value = value !== undefined && value !== null;
    }
    return value;
  }

  function parseUnary() {
    if (peek() && peek().type === "MINUS") {
      consume();
      return -parseUnary();
    }
    return parsePostfix();
  }

  function parsePower() {
    let left = parseUnary();
    while (peek() && peek().type === "CARET") {
      consume();
      const right = parseUnary();
      left = Math.pow(left, right);
    }
    return left;
  }

  function parseMulDivMod() {
    let left = parsePower();
    while (peek() && ["STAR", "SLASH", "PERCENT"].includes(peek().type)) {
      const op = consume().type;
      const right = parsePower();
      if (op === "STAR") left *= right;
      else if (op === "SLASH") left /= right;
      else left %= right;
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDivMod();
    while (peek() && ["PLUS", "MINUS"].includes(peek().type)) {
      const op = consume().type;
      const right = parseMulDivMod();
      if (op === "PLUS") left += right;
      else left -= right;
    }
    return left;
  }

  function parseExpression() {
    return parseAddSub();
  }

  const result = parseExpression();
  if (i < tokens.length)
    throw new SyntaxError("Unexpected tokens after expression");
  return result;
};

module.exports = { expressionEvaluator };
