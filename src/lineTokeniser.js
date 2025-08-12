/* =========================
 * Tokenizer (per line)
 * ========================= */

// e.g. demoFunction(3.24, 45, "demo") => [
//   { type: "FUNC_CALL", value: "demoFunction" },
//   { type: "LPAREN", value: "(" },
//   { type: "NUMBER", value: 3.24 },
//   { type: "COMMA", value: "," },
//   { type: "NUMBER", value: 45 },
//   { type: "COMMA", value: "," },
//   { type: "STRING", value: "demo" },
//   { type: "RPAREN", value: ")" }
// ]
const lineTokeniser = (line) => {
  // strip comments
  const raw = line.split("#")[0].trim();
  if (!raw) return [];

  const tokens = [];
  let i = 0;

  const isDigit = (c) => c >= "0" && c <= "9"; // Check if a character is a digit
  const isIdentStart = (c) => /[A-Za-z_]/.test(c); // Check if a character can start an identifier (letters or underscore)
  const isIdent = (c) => /[A-Za-z0-9_]/.test(c); // Check if a character can be part of an identifier (letters, digits, or underscore)
  const push = (type, value) => tokens.push({ type, value }); // Push a token onto the tokens array

  while (i < raw.length) {
    const c = raw[i];

    // skip whitespace
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // string literal: "..."
    if (c === '"') {
      i++; // skip opening "
      let s = "";
      while (i < raw.length && raw[i] !== '"') {
        s += raw[i++];
      }
      if (raw[i] !== '"') throw new SyntaxError("Unterminated string");
      i++; // closing "
      push("STRING", s);
      continue;
    }

    // number: 123 or 3.14 or .5
    if (isDigit(c) || (c === "." && isDigit(raw[i + 1]))) {
      let start = i;
      if (c === ".") i++; // handle leading dot
      while (i < raw.length && isDigit(raw[i])) i++;
      if (raw[i] === "." && isDigit(raw[i + 1])) {
        i++;
        while (i < raw.length && isDigit(raw[i])) i++;
      }
      const numText = raw.slice(start, i);
      push("NUMBER", Number(numText));
      continue;
    }

    // braces: { and }
    if (c === "{" || c === "}") {
      push("BRACE", c);
      i++;
      continue;
    }

    // parentheses
    if (c === "(") {
      push("LPAREN", "(");
      i++;
      continue;
    }
    if (c === ")") {
      push("RPAREN", ")");
      i++;
      continue;
    }

    // brackets
    if (c === "[") {
      push("LBRACK", "[");
      i++;
      continue;
    }
    if (c === "]") {
      push("RBRACK", "]");
      i++;
      continue;
    }

    // comma
    if (c === ",") {
      push("COMMA", ",");
      i++;
      continue;
    }

    // operators
    if (c === "+") {
      push("PLUS", "+");
      i++;
      continue;
    }
    if (c === "-") {
      push("MINUS", "-");
      i++;
      continue;
    }
    if (c === "*") {
      push("STAR", "*");
      i++;
      continue;
    }
    if (c === "/") {
      push("SLASH", "/");
      i++;
      continue;
    }
    if (c === "^") {
      push("CARET", "^");
      i++;
      continue;
    }
    if (c === "%") {
      push("PERCENT", "%");
      i++;
      continue;
    }

    // function call: function_name(...)
    if (isIdentStart(c)) {
      let start = i++;
      while (i < raw.length && isIdent(raw[i])) i++;
      let word = raw.slice(start, i);

      // Special-case postfix exists: mila?
      // e.g. mila? => { type: "EXISTS", value: "mila?" }
      if (word.toLowerCase() === "mila" && raw[i] === "?") {
        i++; // consume '?'
        push("EXISTS", "mila?");
        continue;
      }

      // Keywords normalization left to interpreter

      // Check if this is a function call with parentheses
      // e.g. square(5, 10) => [
      //   { type: "FUNC_CALL", value: "square" }, { type: "LPAREN", value: "(" }, { type: "NUMBER", value: 5 }, { type: "COMMA", value: "," }, { type: "NUMBER", value: 10 }, { type: "RPAREN", value: ")" }
      // ]
      if (i < raw.length && raw[i] === "(") {
        push("FUNC_CALL", word);
        push("LPAREN", "(");
        i++; // skip opening parenthesis

        // Parse function arguments
        while (i < raw.length && raw[i] !== ")") {
          // Skip whitespace and commas
          if (/\s/.test(raw[i])) {
            i++;
            continue;
          }
          if (raw[i] === ",") {
            push("COMMA", ",");
            i++;
            continue;
          }

          // Parse argument (could be string, number, or identifier)
          if (raw[i] === '"') {
            // String argument
            i++; // skip opening "
            let s = "";
            while (i < raw.length && raw[i] !== '"') {
              s += raw[i++];
            }
            if (raw[i] !== '"')
              throw new SyntaxError("Unterminated string in function call");
            i++; // closing "
            push("STRING", s);
          } else if (
            isDigit(raw[i]) ||
            (raw[i] === "." && isDigit(raw[i + 1]))
          ) {
            // Number argument
            let numStart = i;
            if (raw[i] === ".") i++; // handle leading dot
            while (i < raw.length && isDigit(raw[i])) i++;
            if (raw[i] === "." && isDigit(raw[i + 1])) {
              i++;
              while (i < raw.length && isDigit(raw[i])) i++;
            }
            const numText = raw.slice(numStart, i);
            push("NUMBER", Number(numText));
          } else if (isIdentStart(raw[i])) {
            // Identifier argument
            let identStart = i++;
            while (i < raw.length && isIdent(raw[i])) i++;
            const ident = raw.slice(identStart, i);
            push("WORD", ident);
          } else {
            throw new SyntaxError(
              `Unexpected character in function call: '${raw[i]}'`
            );
          }
        }

        if (i < raw.length && raw[i] === ")") {
          push("RPAREN", ")");
          i++; // skip closing parenthesis
        } else {
          throw new SyntaxError("Unterminated function call");
        }
      } else {
        // Regular word (command or identifier)
        // e.g. BOLO => { type: "WORD", value: "BOLO" }
        push("WORD", word);
      }
      continue;
    }

    throw new SyntaxError(`Unexpected character: '${c}'`);
  }

  return tokens;
};

module.exports = { lineTokeniser };
