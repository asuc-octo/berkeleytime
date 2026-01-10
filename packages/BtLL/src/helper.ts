export const argSplit = (argString: string) => {
  argString = argString.trim();
  const args: string[] = [];
  let lastComma = -1;
  let bracketCounter = 0;
  for (let i = 0; i < argString.length; i++) {
    if (
      argString.charAt(i) === "(" ||
      argString.charAt(i) === "[" ||
      argString.charAt(i) === "{"
    )
      bracketCounter++;
    if (
      argString.charAt(i) === ")" ||
      argString.charAt(i) === "]" ||
      argString.charAt(i) === "}"
    )
      bracketCounter--;
    if (argString.charAt(i) === "," && bracketCounter === 0) {
      const arg = argString.substring(lastComma + 1, i).trim();
      lastComma = i;
      args.push(arg);
    }
  }
  args.push(argString.substring(lastComma + 1).trim());
  return args;
};

/**
 * Splits a string by spaces, but ignores spaces inside brackets (< >), parentheses (),
 * square brackets [ ], and curly braces { }.
 * This allows splitting things like "List<number> res2 filter(list, find_func)" correctly.
 * If brackets are not resolved by the end of a line, continues to the next line.
 * Returns exactly three space-separated values.
 */
export const parseLine = (
  lines: string[],
  index: number
): [string, string, string, number] => {
  const parts: string[] = [];
  let currentPart = "";
  let angleDepth = 0; // Track depth of angle brackets < >
  let parenDepth = 0; // Track depth of parentheses ( )
  let squareDepth = 0; // Track depth of square brackets [ ]
  let curlyDepth = 0; // Track depth of curly braces { }

  let currentIndex = index;

  while (currentIndex < lines.length && parts.length < 3) {
    const line = lines[currentIndex];
    const str = currentIndex === index ? line.trim() : line;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === "<") {
        angleDepth++;
        currentPart += char;
      } else if (char === ">") {
        angleDepth--;
        currentPart += char;
      } else if (char === "(") {
        parenDepth++;
        currentPart += char;
      } else if (char === ")") {
        parenDepth--;
        currentPart += char;
      } else if (char === "[") {
        squareDepth++;
        currentPart += char;
      } else if (char === "]") {
        squareDepth--;
        currentPart += char;
      } else if (char === "{") {
        curlyDepth++;
        currentPart += char;
      } else if (char === "}") {
        curlyDepth--;
        currentPart += char;
      } else if (
        char === " " &&
        angleDepth === 0 &&
        parenDepth === 0 &&
        squareDepth === 0 &&
        curlyDepth === 0
      ) {
        // Only split on space if we're not inside any brackets
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
          currentPart = "";
          // Stop if we have 3 parts
          if (parts.length === 3) break;
        }
      } else {
        currentPart += char;
      }
    }

    // If we have 3 parts, we're done
    if (parts.length === 3) break;

    // If brackets are still open, continue to next line
    if (
      angleDepth !== 0 ||
      parenDepth !== 0 ||
      squareDepth !== 0 ||
      curlyDepth !== 0
    ) {
      // Add a space when continuing to next line (if currentPart is not empty)
      if (currentPart.trim()) {
        currentPart += "\n";
      }
      currentIndex++;
    } else {
      // Brackets are closed, but we might need to add the last part
      break;
    }
  }

  // Add the last part if it exists
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // Ensure we return exactly 3 values
  while (parts.length < 3) {
    parts.push("");
  }

  return [parts[0], parts[1], parts[2], currentIndex];
};

export const functionMatch = (expr: string) => {
  // find the arg list located at the end
  const exprTrimmed = expr.trim();
  if (!exprTrimmed.endsWith(")")) return null;
  let i = exprTrimmed.length - 2;
  let bracketCounter = -1;
  while (i >= 0) {
    if (exprTrimmed.charAt(i) === "(") {
      bracketCounter++;
    } else if (exprTrimmed.charAt(i) === ")") {
      bracketCounter--;
    } else if (exprTrimmed.charAt(i) === "{") {
      bracketCounter++;
    } else if (exprTrimmed.charAt(i) === "}") {
      bracketCounter--;
    } else if (exprTrimmed.charAt(i) === "<") {
      bracketCounter++;
    } else if (exprTrimmed.charAt(i) === ">") {
      bracketCounter--;
    }
    if (bracketCounter === 0) {
      break;
    }
    i--;
  }
  if (i < 0) return null;
  const argList = exprTrimmed.substring(i + 1, exprTrimmed.length - 1);
  return [exprTrimmed.substring(0, i), argList];
};
