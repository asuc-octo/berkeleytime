/**
 * BtLL linter: validates BtLL code and returns structured diagnostics.
 * Mirrors the parsing rules in packages/BtLL/src/helper.ts and interpreter.ts.
 */

// ── Type registry ──────────────────────────────────────────────────────────────

const PRIMITIVE_TYPES = new Set(["boolean", "number", "string", "raw"]);

const OBJECT_TYPES = new Set([
  "Plan",
  "Column",
  "Course",
  "Label",
  "Requirement",
  "BooleanRequirement",
  "NCoursesRequirement",
  "CourseListRequirement",
  "AndRequirement",
  "OrRequirement",
  "NumberRequirement",
]);

const PROTECTED_KEYWORDS = new Set(["true", "false"]);

// All built-in functions known to exist in the BtLL standard library.
const BUILTIN_FUNCTIONS = new Set([
  // logic
  "or",
  "and",
  "not",
  "equal",
  // list
  "filter",
  "find",
  "findIndex",
  "reduce",
  "map",
  "contains",
  "get_element",
  "length",
  "slice",
  "List",
  // number
  "add",
  "subtract",
  "multiply",
  "divide",
  "mod",
  "greater_than",
  "less_than",
  // string
  "regex_match",
  "console_log",
  // utility
  "get_attr",
  "if_else",
  "elseifs",
  // requirement constructors (also valid type names used as function calls)
  "Requirement",
  "BooleanRequirement",
  "NCoursesRequirement",
  "CourseListRequirement",
  "AndRequirement",
  "OrRequirement",
  "NumberRequirement",
  "Course",
]);

// ── Public types ───────────────────────────────────────────────────────────────

export interface BtLLDiagnostic {
  /** 0-based line offset within the BtLL code block. */
  lineOffset: number;
  /** 0-based start column on that line. */
  colStart: number;
  /** 0-based exclusive end column. */
  colEnd: number;
  message: string;
  severity: "error" | "warning";
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Returns true if `line` is a BtLL import line — i.e. it consists entirely of
 * one or more `${...}` template-literal interpolations (with optional surrounding
 * whitespace). These lines inject external BtLL modules and must not be parsed
 * as statements.
 */
function isImportLine(line: string): boolean {
  return /^\s*(\$\{[^{}]*\})+\s*$/.test(line);
}

/**
 * Finds the index of the matching closing character (close) for an opening
 * character (open) starting at openIdx, respecting nesting depth.
 */
function findMatchingClose(
  str: string,
  openIdx: number,
  open: string,
  close: string
): number {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === open) depth++;
    else if (str[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Splits `str` by `sep` at the top level, ignoring separators inside brackets
 * or quotes.
 */
function splitTopLevel(str: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let start = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;
    if (ch === "(" || ch === "[" || ch === "{" || ch === "<") depth++;
    else if (ch === ")" || ch === "]" || ch === "}" || ch === ">") depth--;
    else if (ch === sep && depth === 0) {
      parts.push(str.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(str.slice(start));
  return parts;
}

/**
 * Validates a BtLL type string recursively.
 * Accepts: primitives, object types, single-letter generics (T, G, ...),
 * List<T>, and Function<ReturnType>(ArgType1, ...).
 */
function isValidType(type: string): boolean {
  type = type.trim();
  if (!type) return false;
  if (PRIMITIVE_TYPES.has(type) || OBJECT_TYPES.has(type)) return true;

  // Generic single-letter type parameter (T, G, etc.)
  if (/^[A-Z]$/.test(type)) return true;

  // List<InnerType>
  if (type.startsWith("List<") && type.endsWith(">")) {
    return isValidType(type.slice(5, -1));
  }

  // Function<ReturnType>(ArgType1, ArgType2, ...)
  if (type.startsWith("Function<")) {
    const ltIdx = type.indexOf("<");
    const gtIdx = findMatchingClose(type, ltIdx, "<", ">");
    if (gtIdx === -1) return false;

    const returnType = type.slice(ltIdx + 1, gtIdx);
    if (!isValidType(returnType)) return false;

    const rest = type.slice(gtIdx + 1).trim();
    if (rest === "" || rest === "()") return true;
    if (rest.startsWith("(") && rest.endsWith(")")) {
      const argsStr = rest.slice(1, -1).trim();
      if (argsStr === "") return true;
      return splitTopLevel(argsStr, ",").every((a) => isValidType(a.trim()));
    }
    return false;
  }

  return false;
}

/**
 * Checks that all brackets/quotes in `expr` are balanced.
 * Returns an error message if unbalanced, null if balanced.
 */
function checkBracketBalance(expr: string): string | null {
  const stack: string[] = [];
  let inSingle = false;
  let inDouble = false;
  const matching: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;

    if ("([{".includes(ch)) {
      stack.push(ch);
    } else if (")]}".includes(ch)) {
      if (stack.length === 0 || stack[stack.length - 1] !== matching[ch]) {
        return `Unmatched '${ch}'`;
      }
      stack.pop();
    }
  }

  if (inSingle) return "Unclosed single-quote string literal";
  if (inDouble) return "Unclosed double-quote string literal";
  if (stack.length > 0) return `Unclosed '${stack[stack.length - 1]}'`;
  return null;
}

/**
 * Mirrors packages/BtLL/src/helper.ts parseLine.
 * Splits a statement into [type, varname, expr], spanning multiple lines when
 * brackets are open at a line boundary.
 *
 * Returns [type, varname, expr, lastLineIndex].
 */
export function parseBtLLLine(
  lines: string[],
  startIdx: number
): [string, string, string, number] {
  const parts: string[] = [];
  let currentPart = "";
  let angleDepth = 0;
  let parenDepth = 0;
  let squareDepth = 0;
  let curlyDepth = 0;
  let currentIndex = startIdx;

  while (currentIndex < lines.length && parts.length < 3) {
    const line = lines[currentIndex];
    const str = currentIndex === startIdx ? line.trim() : line;

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
        curlyDepth === 0 &&
        parts.length < 2
      ) {
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
          currentPart = "";
        }
      } else {
        currentPart += char;
      }
    }

    if (parts.length === 3) break;

    const stillOpen =
      angleDepth !== 0 ||
      parenDepth !== 0 ||
      squareDepth !== 0 ||
      curlyDepth !== 0;

    if (stillOpen) {
      if (currentPart.trim()) currentPart += "\n";
      currentIndex++;
    } else {
      break;
    }
  }

  if (currentPart.trim()) parts.push(currentPart.trim());
  while (parts.length < 3) parts.push("");

  return [parts[0], parts[1], parts[2], currentIndex];
}

// ── Column helpers ─────────────────────────────────────────────────────────────

/** Returns the column of `token` on `line`, or 0 if not found. */
function tokenCol(line: string, token: string): number {
  const idx = line.indexOf(token);
  return idx >= 0 ? idx : 0;
}

// ── Core linter ────────────────────────────────────────────────────────────────

/**
 * Lints a string of BtLL code and returns a list of diagnostics.
 *
 * @param code        The raw BtLL source code.
 * @param lineBase    Line offset to add to every diagnostic (used for recursive
 *                    function-body linting so errors point at the right document line).
 * @param knownNames  Set of variable/function names in scope (built-in + outer scope).
 */
export function lintBtLL(
  code: string,
  lineBase: number = 0,
  knownNames: Set<string> = new Set(BUILTIN_FUNCTIONS)
): BtLLDiagnostic[] {
  const diagnostics: BtLLDiagnostic[] = [];
  const lines = code.split("\n");

  // Track names defined in this scope so we can warn on use of unknown functions.
  const localNames = new Set<string>(knownNames);
  let hasMain = lineBase === 0; // only require main at the top level; start false
  hasMain = false;

  // If any import lines are present, external modules may define arbitrary names,
  // so unknown-function/variable warnings are suppressed for this scope.
  const hasExternalImports = lines.some((l) => isImportLine(l));

  function err(
    lineOffset: number,
    colStart: number,
    colEnd: number,
    message: string
  ) {
    diagnostics.push({
      lineOffset: lineBase + lineOffset,
      colStart,
      colEnd,
      message,
      severity: "error",
    });
  }

  function warn(
    lineOffset: number,
    colStart: number,
    colEnd: number,
    message: string
  ) {
    diagnostics.push({
      lineOffset: lineBase + lineOffset,
      colStart,
      colEnd,
      message,
      severity: "warning",
    });
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines, comment lines, and import lines.
    if (trimmed === "" || trimmed.startsWith("//") || isImportLine(line)) {
      i++;
      continue;
    }

    const [type, varname, expr, endIdx] = parseBtLLLine(lines, i);
    const lineNum = i; // report errors on the first line of the statement

    // ── 1. Type must be present ──
    if (!type) {
      err(lineNum, 0, trimmed.length, "Statement is missing a type");
      i = endIdx + 1;
      continue;
    }

    // ── 2. Type must be valid ──
    if (!isValidType(type)) {
      const col = tokenCol(line, type.split("\n")[0]);
      err(
        lineNum,
        col,
        col + type.split("\n")[0].length,
        `Unknown or invalid type '${type.split("\n")[0]}'`
      );
    }

    // ── 3. Variable name must be present ──
    if (!varname) {
      err(
        lineNum,
        type.length + 1,
        trimmed.length,
        "Missing variable name after type"
      );
      i = endIdx + 1;
      continue;
    }

    // ── 4. 'return' is the only reserved word valid as a variable name ──
    if (varname !== "return") {
      if (!isValidIdentifier(varname)) {
        const col = tokenCol(line, varname);
        err(
          lineNum,
          col,
          col + varname.length,
          `Invalid identifier '${varname}'`
        );
      }

      if (PROTECTED_KEYWORDS.has(varname)) {
        const col = tokenCol(line, varname);
        err(
          lineNum,
          col,
          col + varname.length,
          `'${varname}' is a protected keyword and cannot be used as a variable name`
        );
      }
    }

    // ── 5. Expression must be present (except bare 'return' with no expr is an error) ──
    if (!expr) {
      err(lineNum, 0, trimmed.length, "Missing expression");
      i = endIdx + 1;
      continue;
    }

    // ── 6. Function-type statements ──
    if (type.startsWith("Function<")) {
      // Register the function name in local scope.
      if (varname !== "return" && isValidIdentifier(varname)) {
        localNames.add(varname);
        if (varname === "main") hasMain = true;
      }

      // expr must be: (param1, param2, ...) { body }
      const parenStart = expr.indexOf("(");
      if (parenStart === -1) {
        err(
          lineNum,
          0,
          trimmed.length,
          "Function definition is missing its parameter list '(...)'"
        );
        i = endIdx + 1;
        continue;
      }

      const parenEnd = findMatchingClose(expr, parenStart, "(", ")");
      if (parenEnd === -1) {
        err(
          lineNum,
          0,
          trimmed.length,
          "Function parameter list is missing closing ')'"
        );
        i = endIdx + 1;
        continue;
      }

      // Validate parameter names
      const paramStr = expr.slice(parenStart + 1, parenEnd).trim();
      if (paramStr !== "") {
        const params = paramStr.split(",").map((p) => p.trim());
        for (const param of params) {
          if (!isValidIdentifier(param)) {
            const col = tokenCol(line, param);
            err(
              lineNum,
              col,
              col + param.length,
              `Invalid parameter name '${param}'`
            );
          }
        }
      }

      // Validate arg count matches function type signature
      const typeArgStr = type
        .slice(type.indexOf("(") + 1, type.lastIndexOf(")"))
        .trim();
      const typeArgCount =
        typeArgStr === "" ? 0 : splitTopLevel(typeArgStr, ",").length;
      const paramCount =
        paramStr === "" ? 0 : splitTopLevel(paramStr, ",").length;
      if (typeArgStr !== "" && typeArgCount !== paramCount) {
        err(
          lineNum,
          0,
          trimmed.length,
          `Function type declares ${typeArgCount} parameter(s) but definition has ${paramCount}`
        );
      }

      // Function body: must have { ... }
      const braceStart = expr.indexOf("{", parenEnd);
      if (braceStart === -1) {
        err(
          lineNum,
          0,
          trimmed.length,
          "Function definition is missing its body '{ ... }'"
        );
        i = endIdx + 1;
        continue;
      }

      const braceEnd = findMatchingClose(expr, braceStart, "{", "}");
      if (braceEnd === -1) {
        err(lineNum, 0, trimmed.length, "Function body is missing closing '}'");
        i = endIdx + 1;
        continue;
      }

      // Recursively lint the function body.
      const bodyText = expr.slice(braceStart + 1, braceEnd).trim();
      if (bodyText) {
        // Compute the line offset of the body start within the original code.
        // Count newlines in `expr` before the braceStart position.
        const exprBeforeBrace = expr.slice(0, braceStart);
        const newlinesBeforeBrace = (exprBeforeBrace.match(/\n/g) ?? []).length;
        const bodyLineBase = lineBase + lineNum + newlinesBeforeBrace + 1;

        // Build parameters as known names for the function body scope.
        const bodyScope = new Set<string>(localNames);
        if (paramStr !== "") {
          splitTopLevel(paramStr, ",")
            .map((p) => p.trim())
            .filter((p) => isValidIdentifier(p))
            .forEach((p) => bodyScope.add(p));
        }

        // Lint body with its own lineBase (not adding lineBase again since
        // lintBtLL adds lineBase internally).
        const bodyDiags = lintBtLL(bodyText, bodyLineBase, bodyScope);
        diagnostics.push(...bodyDiags);
      }
    } else {
      // ── 7. Non-function statement: validate the expression ──

      // a) Check bracket balance
      const balErr = checkBracketBalance(expr);
      if (balErr) {
        err(lineNum, 0, trimmed.length, balErr);
      }

      // b) Warn if expression looks like a function call to an unknown name.
      // Suppressed when external imports are present since they may define the callee.
      if (!hasExternalImports) {
        const callMatch = expr.match(
          /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<[^>]*>)?\s*\(/
        );
        if (callMatch) {
          const callee = callMatch[1];
          if (!localNames.has(callee) && !BUILTIN_FUNCTIONS.has(callee)) {
            const col = tokenCol(line, callee);
            warn(
              lineNum,
              col,
              col + callee.length,
              `Unknown function or variable '${callee}'`
            );
          }
        }
      }

      // c) If the expression is a bare identifier, check it exists in scope.
      // Suppressed when external imports are present.
      if (
        !hasExternalImports &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr) &&
        !PROTECTED_KEYWORDS.has(expr) &&
        !localNames.has(expr)
      ) {
        const col = tokenCol(line, expr);
        warn(
          lineNum,
          col,
          col + expr.length,
          `'${expr}' is not defined in this scope`
        );
      }

      // d) Validate list literal syntax
      const exprTrimmed = expr.trim();
      if (exprTrimmed.startsWith("[") && exprTrimmed.endsWith("]")) {
        const inner = exprTrimmed.slice(1, -1).trim();
        if (inner === "" && type.startsWith("List<")) {
          warn(
            lineNum,
            tokenCol(line, "["),
            tokenCol(line, "]") + 1,
            "Empty list — consider specifying a type"
          );
        }
      }

      // e) Validate string literal is properly quoted
      if (type === "string") {
        const stripped = exprTrimmed;
        const isDoubleQuoted =
          stripped.startsWith('"') &&
          stripped.endsWith('"') &&
          stripped.length >= 2;
        const isSingleQuoted =
          stripped.startsWith("'") &&
          stripped.endsWith("'") &&
          stripped.length >= 2;
        const isVarRef = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(stripped);
        const isFunctionCall = stripped.endsWith(")");
        if (
          !isDoubleQuoted &&
          !isSingleQuoted &&
          !isVarRef &&
          !isFunctionCall
        ) {
          const col = tokenCol(line, stripped.split("\n")[0]);
          err(
            lineNum,
            col,
            col + stripped.length,
            "String value must be quoted with \" or '"
          );
        }
      }

      // f) Validate boolean literal
      if (type === "boolean") {
        const stripped = exprTrimmed;
        const isLiteral = stripped === "true" || stripped === "false";
        const isVarRef = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(stripped);
        const isFunctionCall = stripped.endsWith(")");
        if (!isLiteral && !isVarRef && !isFunctionCall) {
          const col = tokenCol(line, stripped);
          err(
            lineNum,
            col,
            col + stripped.length,
            "Boolean expression must be 'true', 'false', a variable, or a function call"
          );
        }
      }

      // g) Validate number literal
      if (type === "number") {
        const stripped = exprTrimmed;
        const isNumber = /^-?\d+(\.\d+)?$/.test(stripped);
        const isVarRef = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(stripped);
        const isFunctionCall = stripped.endsWith(")");
        if (!isNumber && !isVarRef && !isFunctionCall) {
          const col = tokenCol(line, stripped.split("\n")[0]);
          warn(
            lineNum,
            col,
            col + stripped.length,
            "Expected a number literal, variable, or function call for number type"
          );
        }
      }

      // Register non-return assignments into scope
      if (varname !== "return" && isValidIdentifier(varname)) {
        localNames.add(varname);
      }
    }

    i = endIdx + 1;
  }

  // ── 8. Top-level programs must define a main function ──
  if (lineBase === 0 && !hasMain) {
    diagnostics.push({
      lineOffset: 0,
      colStart: 0,
      colEnd: 0,
      message: "BtLL program must define a 'main' function",
      severity: "warning",
    });
  }

  return diagnostics;
}
