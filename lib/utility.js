const checkNameToken = (message, nameToken) => {
  if (!nameToken || nameToken.type !== "WORD") throw new SyntaxError(message);
  return nameToken.value;
};

module.exports = { checkNameToken };
