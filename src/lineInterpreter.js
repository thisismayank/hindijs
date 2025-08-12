const {
  expressionEvaluator,
  variableResolver,
  checkNameToken,
} = require("../lib/index.js");

/* =========================
 * Interpreter (per line)
 * ========================= */
function lineInterpreter(tokens, env, functionManager) {
  if (tokens.length === 0) return; // empty/comment-only line

  const head = tokens[0];

  // Handle function calls with parentheses syntax: function_name(...)
  if (head.type === "FUNC_CALL") {
    const funcName = head.value;
    const args = [];

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "NUMBER" || token.type === "STRING") {
        args.push(token.value);
      } else if (token.type === "WORD") {
        args.push(variableResolver(env, token.value));
      }
      // ignore LPAREN, RPAREN, COMMA
    }

    functionManager.executeFunction(funcName, args, env, lineInterpreter);
    return;
  }

  // Infix assignment: <name> HAI <expr>
  if (
    tokens.length >= 3 &&
    tokens[0].type === "WORD" &&
    tokens[1].type === "WORD" &&
    tokens[1].value.toLowerCase() === "hai"
  ) {
    const variableName = checkNameToken("HAI needs a variable name", tokens[0]);
    const exprTokens = tokens.slice(2);
    const val = expressionEvaluator(exprTokens, env);
    env.vars[variableName] = val;
    return;
  }

  if (head.type !== "WORD")
    throw new SyntaxError("Command must start with a word");

  const cmdRaw = head.value;
  const cmd = cmdRaw.toUpperCase();

  // New Hindi aliases mapping
  const is = cmdRaw.toLowerCase() === "hai"; // infix assignment requires custom handling

  // HAI assignment: <name> HAI <expr>
  if (is) {
    const nameTok = tokens[0];
    const haiTok = tokens[1];
    if (
      !haiTok ||
      haiTok.type !== "WORD" ||
      haiTok.value.toLowerCase() !== "hai"
    ) {
      throw new SyntaxError("Expected HAI after variable name");
    }
    const variableName = checkNameToken("HAI needs a variable name", nameTok);
    const exprTokens = tokens.slice(2);
    if (exprTokens.length === 0) throw new SyntaxError("HAI needs a value");
    const val = expressionEvaluator(exprTokens, env);
    env.vars[variableName] = val;
    return;
  }

  // Handle BOLO (print)
  if (cmdRaw.toLowerCase() === "bolo") {
    // Special-case: function call as primary, e.g., BOLO square(9)
    if (tokens[1] && tokens[1].type === "FUNC_CALL") {
      const funcName = tokens[1].value;
      // Collect args between the following LPAREN .. matching RPAREN
      const argsTokens = tokens.slice(2); // starts with LPAREN
      // Extract the content inside top-level parentheses
      let depth = 0;
      const inner = [];
      for (let i = 0; i < argsTokens.length; i++) {
        const t = argsTokens[i];
        if (t.type === "LPAREN") {
          depth++;
          if (depth === 1) continue;
        }
        if (t.type === "RPAREN") {
          depth--;
          if (depth === 0) break;
        }
        if (depth >= 1) inner.push(t);
      }
      // Split inner by top-level commas to expressions
      const args = [];
      if (inner.length > 0) {
        let current = [];
        depth = 0;
        for (const t of inner) {
          if (t.type === "LPAREN" || t.type === "LBRACK") depth++;
          if (t.type === "RPAREN" || t.type === "RBRACK") depth--;
          if (t.type === "COMMA" && depth === 0) {
            if (current.length > 0)
              args.push(expressionEvaluator(current, env));
            current = [];
          } else {
            current.push(t);
          }
        }
        if (current.length > 0) args.push(expressionEvaluator(current, env));
      }
      const ret = functionManager.executeFunction(
        funcName,
        args,
        env,
        lineInterpreter
      );
      console.log(ret);
      return;
    }
    const val = expressionEvaluator(tokens.slice(1), env);
    console.log(val);
    return;
  }

  // Handle RETURN via lotaao
  if (cmdRaw.toLowerCase() === "lotaao") {
    const returnVal =
      tokens.length > 1 ? expressionEvaluator(tokens.slice(1), env) : undefined;
    env.returnSignal = returnVal;
    return;
  }

  // Handle kaam_karo remains
  switch (cmd) {
    case "KAAM_KARO": {
      if (tokens.length < 2)
        throw new SyntaxError("kaam_karo needs a function name");
      const funcName = checkNameToken(
        "kaam_karo needs a function name",
        tokens[1]
      );
      const argsExpr = tokens.slice(2);

      const hasComma = argsExpr.some((t) => t.type === "COMMA");
      const args = [];

      if (argsExpr.length > 0) {
        if (hasComma) {
          // Comma-separated: split by commas and eval each chunk as an expression
          let current = [];
          for (const t of argsExpr) {
            if (t.type === "COMMA") {
              if (current.length > 0)
                args.push(expressionEvaluator(current, env));
              current = [];
            } else {
              current.push(t);
            }
          }
          if (current.length > 0) args.push(expressionEvaluator(current, env));
        } else {
          // Whitespace-separated: treat each top-level atom/paren group as an arg
          let i = 0;
          while (i < argsExpr.length) {
            const t = argsExpr[i];
            if (t.type === "LPAREN") {
              // collect balanced parentheses group
              let depth = 0;
              const group = [];
              while (i < argsExpr.length) {
                const g = argsExpr[i++];
                group.push(g);
                if (g.type === "LPAREN") depth++;
                else if (g.type === "RPAREN") {
                  depth--;
                  if (depth === 0) break;
                }
              }
              args.push(expressionEvaluator(group, env));
            } else {
              // single-token argument (WORD/NUMBER/STRING)
              args.push(expressionEvaluator([t], env));
              i++;
            }
          }
        }
      }

      functionManager.executeFunction(funcName, args, env, lineInterpreter);
      return;
    }

    case "YAAR": {
      // Keep legacy: YAAR <name> <number or expr>
      const nameTok = tokens[1];
      const variableName = checkNameToken(
        "YAAR needs a variable name",
        nameTok
      );
      const exprTokens = tokens.slice(2);
      const val = expressionEvaluator(exprTokens, env);
      env.vars[variableName] = val;
      console.log(`🫡 Yaar, ${variableName} is now ${val}`);
      return;
    }

    case "ADD": {
      const nameTok = tokens[1];
      const variableName = checkNameToken("ADD needs a variable name", nameTok);
      if (!(variableName in env.vars))
        throw new ReferenceError(`Unknown variable "${variableName}"`);
      const delta = expressionEvaluator(tokens.slice(2), env);
      env.vars[variableName] += delta;
      console.log(
        `${variableName} is now ${env.vars[variableName]} ➕ Add kar diya!`
      );
      return;
    }

    case "MINUS": {
      const nameTok = tokens[1];
      const variableName = checkNameToken(
        "MINUS needs a variable name",
        nameTok
      );
      if (!(variableName in env.vars))
        throw new ReferenceError(`Unknown variable "${variableName}"`);
      const delta = expressionEvaluator(tokens.slice(2), env);
      env.vars[variableName] -= delta;
      console.log(
        `${variableName} is now ${env.vars[variableName]} ➖ Minus kar diya!`
      );
      return;
    }

    case "MULTIPLY": {
      const nameTok = tokens[1];
      const variableName = checkNameToken(
        "MULTIPLY needs a variable name",
        nameTok
      );
      if (!(variableName in env.vars))
        throw new ReferenceError(`Unknown variable "${variableName}"`);
      const mult = expressionEvaluator(tokens.slice(2), env);
      env.vars[variableName] *= mult;
      console.log(
        `${variableName} is now ${env.vars[variableName]} ✖️ Multiply kar diya!`
      );
      return;
    }

    case "DIVIDE": {
      const nameTok = tokens[1];
      const variableName = checkNameToken(
        "DIVIDE needs a variable name",
        nameTok
      );
      if (!(variableName in env.vars))
        throw new ReferenceError(`Unknown variable "${variableName}"`);
      const div = expressionEvaluator(tokens.slice(2), env);
      if (div === 0) throw new TypeError("Can't divide by zero, yaar!");
      env.vars[variableName] /= div;
      console.log(
        `${variableName} is now ${env.vars[variableName]} ➗ Divide kar diya!`
      );
      return;
    }

    case "PRINT": {
      if (tokens.length < 2) throw new SyntaxError("PRINT needs a value");
      const val = expressionEvaluator(tokens.slice(1), env);
      console.log(val);
      return;
    }

    case "BOLO": {
      const val = expressionEvaluator(tokens.slice(1), env);
      console.log(val);
      return;
    }

    case "BHEJO": {
      // BHEJO <name> [expr]
      if (tokens.length < 2) throw new SyntaxError("BHEJO needs a name");
      const exportName = checkNameToken("BHEJO needs a name", tokens[1]);
      if (!env.exports) env.exports = Object.create(null);
      if (!env.exports.__fns) env.exports.__fns = [];

      if (tokens.length > 2) {
        const value = expressionEvaluator(tokens.slice(2), env);
        env.exports[exportName] = value;
        return;
      }

      // No expression: export a variable or a function by name
      try {
        const value = variableResolver(env, exportName);
        env.exports[exportName] = value;
      } catch (e) {
        // If not a variable, check functions
        if (
          functionManager &&
          functionManager.functions &&
          functionManager.functions.has(exportName)
        ) {
          env.exports.__fns.push(exportName);
        } else {
          throw e;
        }
      }
      return;
    }

    case "BAS_KAR": {
      env.breakSignal = true;
      return;
    }

    case "AGLA": {
      env.continueSignal = true;
      return;
    }

    default:
      // Allow plain expression statements (e.g., function calls handled earlier)
      // Fallback to previous arithmetic commands for backward compatibility
      // If expression is just a value, evaluate and ignore
      try {
        expressionEvaluator(tokens, env);
        return;
      } catch (e) {
        throw new SyntaxError(`Unknown command "${cmd}"`);
      }
  }
}

module.exports = { lineInterpreter };
