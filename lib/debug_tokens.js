const { lineTokeniser } = require("./src/lineTokeniser.js");

const line = 'FUNCTION test_func a { PRINT "Inside function" PRINT a }';
const tokens = lineTokeniser(line);
console.log("Tokens:", JSON.stringify(tokens, null, 2));
