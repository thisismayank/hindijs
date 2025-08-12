/* =========================
 * Function Manager
 * ========================= */

class FunctionManager {
  constructor() {
    this.functions = new Map();
    this.callStack = [];
  }

  defineFunction(name, parameters, body, definingEnv) {
    if (this.functions.has(name)) {
      throw new Error(`Function "${name}" already exists, yaar!`);
    }
    this.functions.set(name, {
      parameters,
      body, // array of token lines
      env: definingEnv,
    });
    console.log(
      `🫡 Function "${name}" ban gayi! Parameters: ${parameters.join(", ")}`
    );
  }

  executeFunction(name, args, currentEnv, lineInterpreter) {
    if (!this.functions.has(name)) {
      throw new ReferenceError(`Function "${name}" not found, bhai!`);
    }
    const fn = this.functions.get(name);
    if (args.length !== fn.parameters.length) {
      throw new Error(
        `Function "${name}" expects ${fn.parameters.length} arguments, but got ${args.length}`
      );
    }

    const funcEnv = {
      vars: Object.create(null),
      parent: currentEnv,
      returnSignal: undefined,
      breakSignal: false,
      continueSignal: false,
    };

    for (let i = 0; i < fn.parameters.length; i++) {
      funcEnv.vars[fn.parameters[i]] = args[i];
    }

    this.callStack.push(name);
    try {
      for (const lineTokens of fn.body) {
        // Allow return within functions via special signal
        lineInterpreter(lineTokens, funcEnv, this);
        if (funcEnv.returnSignal !== undefined) {
          return funcEnv.returnSignal;
        }
      }
    } finally {
      this.callStack.pop();
    }

    return undefined;
  }

  getCallStack() {
    return [...this.callStack];
  }
}

module.exports = { FunctionManager };
