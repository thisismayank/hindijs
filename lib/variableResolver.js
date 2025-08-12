const variableResolver = (env, name) => {
  let scope = env;
  while (scope) {
    if (scope.vars && Object.prototype.hasOwnProperty.call(scope.vars, name)) {
      return scope.vars[name];
    }
    scope = scope.parent;
  }
  throw new ReferenceError(`Unknown variable "${name}"`);
};

module.exports = { variableResolver };
