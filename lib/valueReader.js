const valueReader = (tok, env) => {
  if (!tok) throw new SyntaxError("Missing argument");
  switch (tok.type) {
    case "NUMBER":
      return tok.value;
    case "STRING":
      return tok.value;
    case "WORD": {
      const name = tok.value;
      if (!(name in env.vars))
        throw new ReferenceError(`Unknown variable "${name}"`);
      return env.vars[name];
    }
    default:
      throw new SyntaxError("Bad argument");
  }
};

module.exports = { valueReader };
