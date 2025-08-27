# HindimeJS 🫡

> **A tiny, fun programming language in Hindi slang — to test how a language parser works!**

[![npm version](https://badge.fury.io/js/hindimejs.svg)](https://badge.fury.io/js/hindimejs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **Hindi Slang Syntax** - Write code in familiar Hindi words
- **Simple & Fun** - Easy to learn, fun to use
- **Full Featured** - Variables, functions, control flow, modules
- **Cross Platform** - Works on Windows, Mac, and Linux
- **Lightweight** - Minimal dependencies, fast execution

## 🚀 Quick Start

### Installation

```bash
npm install -g hindimejs
```

### Your First Program

Create a file called `hello.hindi`:

```hindi
# My first HindimeJS program!
name HAI "Desi Developer"
BOLO "Namaste, " + name + "!"
```

Run it:

```bash
hindijs hello.hindi
```

**Output:**

```
Namaste, Developer!
```

## 📚 Language Guide

### Variables & Assignment

Use `HAI` for infix assignment (feels natural!):

```hindi
marks HAI 95
name HAI "Bhai"
flag HAI sach     # true
empty HAI khaali  # null
```

Legacy syntax (still supported):

```hindi
YAAR score 100
```

### Math Operations

```hindi
# Basic arithmetic
result HAI 10 + 5 * 2
BOLO result  # 20

# Power and modulo
power HAI 2 ^ 8
remainder HAI 17 % 5
```

### Functions

Define functions with `kaam` and call them with `kaam_karo`:

```hindi
kaam greet name {
    message HAI "Namaste, " + name + "!"
    lotaao message
}

kaam_karo greet "Desi Developer"
```

Or use parentheses syntax:

```hindi
greet("World")
```

#### Capturing return values

Use `lotaao` inside a function to return a value, and assign it with `HAI` when calling via parentheses syntax.

```hindi
kaam greet name {
    lotaao "Namaste, " + name + "!"
}

msg HAI greet("Mayank")
BOLO msg
```

Note: `kaam_karo greet "Mayank"` executes the function but does not return a value you can assign.

### Control Flow

**If-Else:**

```hindi
score HAI 85

agar score >= 90 {
    BOLO "Excellent!"
}
nahi_to score >= 80 {
    BOLO "Good job!"
}
warna {
    BOLO "Keep trying!"
}
```

**Loops:**

```hindi
# While loop
i HAI 0
jab_tak i < 5 {
    BOLO i
    i HAI i + 1
}

# For loop
har_ek item in [1, 2, 3, 4, 5] {
    BOLO "Number: " + item
}
```

### Arrays & Data Structures

```hindi
# Create arrays
numbers HAI [1, 2, 3, 4, 5]
names HAI ["Amit", "Priya", "Raj"]

# Access elements
first HAI numbers[0]
BOLO "First number: " + first
```

### Modules

**Export from `math.hindi`:**

```hindi
PI HAI 3.14159

kaam square x {
    lotaao x * x
}

BHEJO PI
BHEJO square
```

**Import in `main.hindi`:**

```hindi
lao "math.hindi"
BOLO "Pi is: " + PI
BOLO "Square of 5: " + square(5)
```

## 🎯 Examples

### Calculator Function

```hindi
kaam calculate operation a b {
    agar operation == "add" {
        lotaao a + b
    }
    nahi_to operation == "multiply" {
        lotaao a * b
    }
    warna {
        lotaao "Invalid operation"
    }
}

BOLO calculate("add", 10, 5)      # 15
BOLO calculate("multiply", 4, 6)  # 24
```

### Simple Game

```hindi
# Guess the number game
secret HAI 42
attempts HAI 0

BOLO "Guess the number between 1 and 100!"

jab_tak sach {
    attempts HAI attempts + 1
    guess HAI 50  # In real app, get user input

    agar guess == secret {
        BOLO "Correct! You took " + attempts + " attempts."
        bas_kar
    }
    nahi_to guess > secret {
        BOLO "Too high!"
    }
    warna {
        BOLO "Too low!"
    }
}
```

## 📦 CLI Usage

```bash
# Run a program
hindijs program.hindi

# Get help
hindijs --help

# Check version
hindijs --version
```

## 🛠️ Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

```bash
git clone https://github.com/thisismayank/hindijs.git
cd hindijs
npm install
npm test
```

### Project Structure

```
hindijs/
├── src/
│   ├── lineTokeniser.js    # Tokenizes input
│   ├── lineInterpreter.js  # Interprets commands
│   ├── functionParser.js   # Handles functions
│   └── controlParser.js    # Handles control flow
├── lib/
│   ├── expressionEvaluator.js
│   ├── variableResolver.js
│   └── ...
├── examples/
│   ├── demo.hindi
│   ├── functions_demo.hindi
│   └── control_flow_demo.hindi
└── hindi.js               # Main entry point
```

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Keep it **meme-friendly** and fun! 😄
- Add **Hindi comments** in code
- Write **tests** for new features
- Update **documentation** for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Part of a learning series where I want to understand the workings of the tools I use daily.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/thisismayank/hindijs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thisismayank/hindijs/discussions)

---

**Made with ❤️ for the desi developer community**

_"Coding kar raha hun, masti mein!"_ 🚀
