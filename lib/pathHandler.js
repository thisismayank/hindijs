const fs = require("fs");
const path = require("path");

/*
🫡 HindimeJS - A programming language for desi developers, by desi developers! 🫡

Usage:
hindijs <program.hindi>    # Run a HindimeJS program
hindijs --help            # Show this help
hindijs --version         # Show version

Examples:
hindijs demo.hindi        # Run the demo program
hindijs sample.hindi      # Run the sample program
*/

function pathHandler(inputPath) {
  // If no path provided, show help
  if (!inputPath) {
    console.log("🫡 HindimeJS v1.0.0 - Where every program is a masti program!");
    console.log("");
    console.log("Usage:");
    console.log("  hindijs <program.hindi>    # Run a HindimeJS program");
    console.log("  hindijs --help            # Show this help");
    console.log("  hindijs --version         # Show version");
    console.log("");
    console.log("Examples:");
    console.log("  hindijs demo.hindi        # Run the demo program");
    console.log("  hindijs sample.hindi      # Run the sample program");
    console.log("");
    console.log("🫡 Made with ❤️ for the desi developer community!");
    process.exit(0);
  }

  // Handle help flag
  if (inputPath === "--help" || inputPath === "-h") {
    console.log("🫡 HindimeJS v1.0.0 - Where every program is a masti program!");
    console.log("");
    console.log("Usage:");
    console.log("  hindijs <program.hindi>    # Run a HindimeJS program");
    console.log("  hindijs --help            # Show this help");
    console.log("  hindijs --version         # Show version");
    console.log("");
    console.log("Examples:");
    console.log("  hindijs demo.hindi        # Run the demo program");
    console.log("  hindijs sample.hindi      # Run the sample program");
    console.log("");
    console.log("🫡 Made with ❤️ for the desi developer community!");
    process.exit(0);
  }

  // Handle version flag
  if (inputPath === "--version" || inputPath === "-v") {
    console.log("🫡 HindimeJS v1.0.0 - Where every program is a masti program!");
    process.exit(0);
  }

  // Validate file extension
  if (!inputPath.endsWith(".hindi")) {
    console.error("🫡 Error: File must have .hindi extension");
    console.error("🫡 Usage: hindijs <program.hindi>");
    console.error("🫡 Run 'hindijs --help' for more information");
    process.exit(1);
  }

  // Resolve the file path
  const resolvedPath = path.resolve(inputPath);

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(`🫡 Error: File '${inputPath}' not found`);
    console.error("🫡 Make sure the file exists and try again");
    process.exit(1);
  }

  return resolvedPath;
}

module.exports = { pathHandler };
