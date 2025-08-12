#!/usr/bin/env node
/* HindimeJS — a tiny meme language in Hindi slang
 *
 * Syntax (whitespace-separated, one command per line):
 *   YAAR <name> <number>       # declare variable with yaar energy
 *   ADD <name> <number>        # add to variable (add kar de)
 *   MINUS <name> <number>      # subtract from variable (minus kar de)
 *   MULTIPLY <name> <number>   # multiply variable (multiply kar de)
 *   DIVIDE <name> <number>     # divide variable (divide kar de)
 *   SUM <vals...>              # sum args and print
 *   PRODUCT <vals...>          # multiply args and print
 *   MAXMIN <high/low> <vals...> # find max/min of args (sabse bada/chota)
 *   RANDOM <name>              # random value (kuch bhi ho sakta hai)
 *   POWER <name> <number>      # exponentiate value (power de)
 *   ZERO <name>                # set to 0 (zero kar de)
 *   ROUND <up/down> <name>     # round up/down (round kar de)
 *   PRINT <value|name|"str">   # print value (print kar de)
 *   FUNCTION <name> <params...> { body } # define function
 *   kaam_karo <name> <args...>      # call function
 *   <name>(<args...>)          # call function with parentheses
 *
 * Extras:
 *   - Comments start with '#'
 *   - Strings use double quotes, e.g., "Masti hai!"
 *   - Numbers can be integers or decimals
 *   - Built-in desi wisdom and motivation
 */

"use strict";

const { lineTokeniser } = require("./src/lineTokeniser.js");
const { lineInterpreter } = require("./src/lineInterpreter.js");
const { pathHandler } = require("./lib/pathHandler.js");
const { FunctionParser } = require("./src/functionParser.js");
const { ControlParser } = require("./src/controlParser.js");

// Module cache and loading guards for lao imports
const moduleCache = new Map();
const loadingModules = new Set();

/* =========================
 * Runner (multi-line program)
 * ========================= */
function runProgram(text, filePath) {
  const env = { vars: Object.create(null), __filePath: filePath || null };
  const functionParser = new FunctionParser();
  const functionManager = functionParser.getFunctionManager();
  const controlParser = new ControlParser();
  const lines = text.split(/\r?\n/);

  for (let ln = 0; ln < lines.length; ln++) {
    const line = lines[ln];
    try {
      const tokenisedLine = lineTokeniser(line);

      // If currently parsing a function definition, capture lines until closing brace
      if (functionParser.isParsingFunction()) {
        if (functionParser.handleBrace(line)) {
          const func = functionParser.finishFunction(env);
          console.log(`🫡 Function "${func.name}" complete ho gayi!`);
        } else {
          functionParser.addToFunctionBody(tokenisedLine);
        }
        continue;
      }

      // helper to capture a control block at a given starting line index for nahi_to/warna
      const captureControlAt = (startIndex) => {
        let headerLine = lines[startIndex];
        if (headerLine === undefined) return null;
        const headerTokens = lineTokeniser(headerLine);
        if (headerTokens.length === 0 || headerTokens[0].type !== "WORD")
          return null;
        const kind = headerTokens[0].value.toLowerCase();
        if (kind !== "nahi_to" && kind !== "warna") return null;
        // ensure there's an opening brace either on this line or next
        let body = [];
        let idx = startIndex;
        let braceCount = 0;
        while (idx < lines.length) {
          const l = lines[idx];
          const toks = lineTokeniser(l);
          const opens = (l.match(/\{/g) || []).length;
          const closes = (l.match(/\}/g) || []).length;
          braceCount += opens - closes;
          if (idx > startIndex) {
            body.push(toks);
          } else {
            const bracePos = toks.findIndex(
              (t) => t.type === "BRACE" && t.value === "{"
            );
            if (bracePos !== -1) {
              const trailing = toks.slice(bracePos + 1);
              if (trailing.length > 0) body.push(trailing);
            }
          }
          if (braceCount <= 0 && idx >= startIndex && idx !== startIndex) break;
          idx++;
        }
        return {
          kind,
          headerTokens,
          body,
          endLn: Math.min(idx, lines.length - 1),
        };
      };

      // If capturing a control block
      if (controlParser.isCapturing()) {
        if (controlParser.handleBrace(line)) {
          const blk = controlParser.finish();
          const kind = blk.kind;
          if (kind === "agar") {
            const condTokens = blk.headerTokens
              .slice(1)
              .filter((t) => t.type !== "BRACE");
            const tmpName = "__if_cond";
            lineInterpreter(
              [
                { type: "WORD", value: tmpName },
                { type: "WORD", value: "hai" },
                ...condTokens,
              ],
              env,
              functionManager
            );
            const condVal = env.vars[tmpName];
            delete env.vars[tmpName];
            if (condVal) {
              for (const bodyLine of blk.body) {
                lineInterpreter(bodyLine, env, functionManager);
                if (env.breakSignal || env.returnSignal !== undefined) break;
              }
              let look = captureControlAt(ln + 1);
              while (look) {
                ln = look.endLn;
                look = captureControlAt(ln + 1);
              }
            } else {
              let consumed = false;
              let cursor = ln + 1;
              while (true) {
                const nextBlk = captureControlAt(cursor);
                if (!nextBlk) break;
                const k = nextBlk.kind;
                if (k === "nahi_to") {
                  const condTokens2 = nextBlk.headerTokens
                    .slice(1)
                    .filter((t) => t.type !== "BRACE");
                  const tmp2 = "__elif_cond";
                  lineInterpreter(
                    [
                      { type: "WORD", value: tmp2 },
                      { type: "WORD", value: "hai" },
                      ...condTokens2,
                    ],
                    env,
                    functionManager
                  );
                  const cond2 = env.vars[tmp2];
                  delete env.vars[tmp2];
                  if (cond2 && !consumed) {
                    for (const bodyLine of nextBlk.body) {
                      lineInterpreter(bodyLine, env, functionManager);
                      if (env.breakSignal || env.returnSignal !== undefined)
                        break;
                    }
                    consumed = true;
                  }
                  cursor = nextBlk.endLn + 1;
                } else if (k === "warna") {
                  if (!consumed) {
                    for (const bodyLine of nextBlk.body) {
                      lineInterpreter(bodyLine, env, functionManager);
                      if (env.breakSignal || env.returnSignal !== undefined)
                        break;
                    }
                    consumed = true;
                  }
                  cursor = nextBlk.endLn + 1;
                  break;
                }
              }
              ln = cursor - 1;
            }
          } else if (kind === "jab_tak") {
            const condTokens = blk.headerTokens
              .slice(1)
              .filter((t) => t.type !== "BRACE");
            const tmpName = "__while_cond";
            let safety = 100000;
            while (safety-- > 0) {
              lineInterpreter(
                [
                  { type: "WORD", value: tmpName },
                  { type: "WORD", value: "hai" },
                  ...condTokens,
                ],
                env,
                functionManager
              );
              const condVal = env.vars[tmpName];
              delete env.vars[tmpName];
              if (!condVal) break;
              for (const bodyLine of blk.body) {
                lineInterpreter(bodyLine, env, functionManager);
                if (env.returnSignal !== undefined) break;
                if (env.breakSignal) {
                  env.breakSignal = false;
                  safety = 0;
                  break;
                }
                if (env.continueSignal) {
                  env.continueSignal = false;
                  break;
                }
              }
              if (env.returnSignal !== undefined) break;
            }
          } else if (kind === "har_ek") {
            const hdr = blk.headerTokens.slice(1);
            const nameTok = hdr[0];
            const inTok = hdr[1];
            const exprTokens = hdr.slice(2).filter((t) => t.type !== "BRACE");
            if (
              !nameTok ||
              nameTok.type !== "WORD" ||
              !inTok ||
              inTok.type !== "WORD" ||
              inTok.value.toLowerCase() !== "in"
            ) {
              throw new SyntaxError(
                "har_ek syntax: har_ek <name> in <expr> { ... }"
              );
            }
            const iterTmp = "__for_iter";
            lineInterpreter(
              [
                { type: "WORD", value: iterTmp },
                { type: "WORD", value: "hai" },
                ...exprTokens,
              ],
              env,
              functionManager
            );
            const iterable = env.vars[iterTmp];
            delete env.vars[iterTmp];
            if (!iterable || !iterable[Symbol.iterator])
              throw new TypeError("har_ek expects an iterable");
            for (const value of iterable) {
              env.vars[nameTok.value] = value;
              for (const bodyLine of blk.body) {
                lineInterpreter(bodyLine, env, functionManager);
                if (env.returnSignal !== undefined) break;
                if (env.breakSignal) {
                  env.breakSignal = false;
                  break;
                }
                if (env.continueSignal) {
                  env.continueSignal = false;
                  break;
                }
              }
              if (env.returnSignal !== undefined || env.breakSignal) {
                env.breakSignal = false;
                break;
              }
            }
          }
          continue;
        } else {
          controlParser.addLine(tokenisedLine);
          continue;
        }
      }

      // Function parsing remains
      if (
        tokenisedLine.length > 0 &&
        tokenisedLine[0].type === "WORD" &&
        ["function", "kaam"].includes(tokenisedLine[0].value.toLowerCase())
      ) {
        const funcName = tokenisedLine[1]?.value;
        if (!funcName) {
          throw new SyntaxError("FUNCTION needs a name");
        }

        const parameters = [];
        let i = 2;
        while (i < tokenisedLine.length && tokenisedLine[i].type === "WORD") {
          parameters.push(tokenisedLine[i].value);
          i++;
        }

        if (i < tokenisedLine.length && tokenisedLine[i].value === "{") {
          const closingIndex = tokenisedLine.findIndex(
            (t, idx) => idx > i && t.type === "BRACE" && t.value === "}"
          );

          if (closingIndex !== -1) {
            const bodyTokens = tokenisedLine.slice(i + 1, closingIndex);
            const bodyLines = [];
            let currentLine = [];

            const isCommandWord = (tok) =>
              tok.type === "WORD" &&
              [
                "YAAR",
                "ADD",
                "MINUS",
                "MULTIPLY",
                "DIVIDE",
                "PRINT",
                "SUM",
                "PRODUCT",
                "MAXMIN",
                "RANDOM",
                "POWER",
                "ZERO",
                "ROUND",
                "kaam_karo",
                "BOLO",
              ].includes(tok.value.toUpperCase());

            for (const token of bodyTokens) {
              if (isCommandWord(token) && currentLine.length > 0) {
                bodyLines.push(currentLine);
                currentLine = [token];
              } else {
                currentLine.push(token);
              }
            }

            if (currentLine.length > 0) {
              bodyLines.push(currentLine);
            }

            functionManager.defineFunction(
              funcName,
              parameters,
              bodyLines,
              env
            );
          } else {
            functionParser.startFunction(funcName, parameters);
            const trailingTokens = tokenisedLine.slice(i + 1);
            if (trailingTokens.length > 0) {
              functionParser.addToFunctionBody(trailingTokens);
            }
            functionParser.handleBrace(line);
          }
        } else {
          functionParser.startFunction(funcName, parameters);
          if (line.includes("{")) {
            functionParser.handleBrace(line);
          }
        }
        continue;
      }

      // Control flow starters: agar, nahi_to, warna, jab_tak, har_ek
      if (tokenisedLine.length > 0 && tokenisedLine[0].type === "WORD") {
        const kw = tokenisedLine[0].value.toLowerCase();
        if (["agar", "nahi_to", "warna", "jab_tak", "har_ek"].includes(kw)) {
          controlParser.start(kw, tokenisedLine);
          if (line.includes("{")) controlParser.handleBrace(line);
          continue;
        }
        if (kw === "lao") {
          // Syntax: lao "path.hindi"
          const fs = require("fs");
          const path = require("path");
          const argTok = tokenisedLine[1];
          if (!argTok || argTok.type !== "STRING")
            throw new SyntaxError("lao needs a string path");
          const modPath = path.resolve(
            filePath ? path.dirname(filePath) : process.cwd(),
            argTok.value
          );
          if (filePath && modPath === filePath) {
            continue; // skip self-import
          }
          if (loadingModules.has(modPath)) {
            continue; // prevent cycles
          }
          if (moduleCache.has(modPath)) {
            const childEnv = moduleCache.get(modPath);
            if (childEnv.exports) {
              for (const [k, v] of Object.entries(childEnv.exports)) {
                if (k === "__fns") continue;
                env.vars[k] = v;
              }
            }
            if (
              childEnv.exports &&
              Array.isArray(childEnv.exports.__fns) &&
              childEnv.__functionManager
            ) {
              for (const fnName of childEnv.exports.__fns) {
                const fnMap = childEnv.__functionManager.functions;
                if (fnMap && fnMap.has(fnName)) {
                  const def = fnMap.get(fnName);
                  functionManager.defineFunction(
                    fnName,
                    def.parameters,
                    def.body,
                    env
                  );
                }
              }
            }
            continue;
          }
          loadingModules.add(modPath);
          const src = fs.readFileSync(modPath, "utf8");
          const childEnv = runProgram(src, modPath);
          moduleCache.set(modPath, childEnv);
          loadingModules.delete(modPath);
          if (childEnv.exports) {
            for (const [k, v] of Object.entries(childEnv.exports)) {
              if (k === "__fns") continue;
              env.vars[k] = v;
            }
          }
          if (
            childEnv.exports &&
            Array.isArray(childEnv.exports.__fns) &&
            childEnv.__functionManager
          ) {
            for (const fnName of childEnv.exports.__fns) {
              const fnMap = childEnv.__functionManager.functions;
              if (fnMap && fnMap.has(fnName)) {
                const def = fnMap.get(fnName);
                functionManager.defineFunction(
                  fnName,
                  def.parameters,
                  def.body,
                  env
                );
              }
            }
          }
          continue;
        }
      }

      lineInterpreter(tokenisedLine, env, functionManager);
    } catch (e) {
      const where = `Line ${ln + 1}: ${line.trim()}`;
      const msg = e && e.message ? e.message : String(e);
      throw new Error(`${msg}\n  -> ${where}`);
    }
  }
  env.__functionManager = functionManager;
  return env; // expose env for tests/embedding
}

/* =========================
 * CLI
 * =========================
 * Usage:
 *   hindijs sample.hindi
 *   hindijs --help
 *   hindijs --version
 */
if (require.main === module) {
  const fs = require("fs");

  const path = pathHandler(process.argv[2]);

  try {
    const src = fs.readFileSync(path, "utf8");
    runProgram(src, path);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`🫡 Error: File '${path}' not found`);
      console.error("🫡 Make sure the file exists and try again");
    } else {
      console.error(err.message || err);
    }
    process.exit(1);
  }
}

/* Exports for embedding/tests */
module.exports = { runProgram };
