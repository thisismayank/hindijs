const pathHandler = (path) => {
  // Handle help and version flags
  if (!path || path === "--help" || path === "-h") {
    console.log(`
🫡 HindiLang - A programming language for desi developers, by desi developers! 🫡

USAGE:
  hindilang <program.hindi>    # Run a HindiLang program
  hindilang --help            # Show this help
  hindilang --version         # Show version

EXAMPLES:
  hindilang demo.hindi        # Run the demo program
  hindilang sample.hindi      # Run the sample program

COMMANDS:
  rakhiyo <name> <value>         # Declare variable with yaar energy
  ADD <name> <value>          # Add to variable (add kar de)
  MINUS <name> <value>        # Subtract from variable (minus kar de)
  MULTIPLY <name> <value>     # Multiply variable (multiply kar de)
  DIVIDE <name> <value>       # Divide variable (divide kar de)
  SUM <vals...>               # Sum values
  PRODUCT <vals...>           # Multiply values
  MAXMIN <high/low> <vals...> # Find maximum/minimum (sabse bada/chota)
  RANDOM <name>               # Random value (kuch bhi ho sakta hai)
  POWER <name> <value>        # Exponentiation (power de)
  ZERO <name>                 # Set to 0 (zero kar de)
  ROUND <up/down> <name>      # Round up/down (round kar de)
  PRINT <value|name|"str">    # Print value (print kar de)

FEATURES:
  - Comments start with '#'
  - Strings use double quotes
  - Numbers can be integers or decimals
  - Built-in desi wisdom and motivation

Remember: Masti hai! 🫡
    `);
    process.exit(0);
  }

  if (path === "--version" || path === "-v") {
    console.log("🫡 HindiLang v1.0.0 - Where every program is a masti program!");
    process.exit(0);
  }

  if (!path) {
    console.error("🫡 Usage: hindilang <program.hindi>");
    console.error("🫡 Run 'hindilang --help' for more information");
    process.exit(1);
  }

  return path;
};

module.exports = { pathHandler };
