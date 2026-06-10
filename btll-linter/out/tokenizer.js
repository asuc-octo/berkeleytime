"use strict";
/**
 * Tokenizes BtLL code blocks into fine-grained tokens used for syntax
 * highlighting. Each token carries a kind that maps 1-to-1 with a decoration
 * type in extension.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenizeBtLL = tokenizeBtLL;
// ── Import-line detection ──────────────────────────────────────────────────────
/** True if the line consists only of `${...}` template-literal interpolations. */
function isImportLine(line) {
    return /^\s*(\$\{[^{}]*\})+\s*$/.test(line);
}
// ── Known identifiers ──────────────────────────────────────────────────────────
const BUILTIN_SET = new Set([
    // logic
    "or", "and", "not", "equal",
    // list
    "filter", "find", "findIndex", "reduce", "map", "contains",
    "get_element", "length", "slice", "List",
    // number
    "add", "subtract", "multiply", "divide", "mod", "greater_than", "less_than",
    // string
    "regex_match", "console_log",
    // utility
    "get_attr", "if_else", "elseifs",
    // requirement / object constructors
    "Requirement", "BooleanRequirement", "NCoursesRequirement",
    "CourseListRequirement", "AndRequirement", "OrRequirement",
    "NumberRequirement", "Course",
]);
const BOOLEAN_LITERALS = new Set(["true", "false"]);
const KEYWORD_NAMES = new Set(["return", "main"]);
// ── Public API ─────────────────────────────────────────────────────────────────
/**
 * Returns all tokens in `code` in document order.
 * Each token's `line` is 0-based within the BtLL code block.
 */
function tokenizeBtLL(code) {
    const tokens = [];
    const lines = code.split("\n");
    // Accumulate user-defined names so we can classify their call sites.
    const userDefinedNames = new Set();
    // Track unclosed `([{` depth from previous lines so that continuation lines
    // (e.g. the items of a multi-line list) are scanned as expressions rather
    // than being mis-parsed as type + varname + expr.
    let openDepth = 0;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const raw = lines[lineIdx];
        const trimmed = raw.trim();
        if (!trimmed)
            continue;
        const indent = raw.length - raw.trimStart().length;
        // ── Import line (e.g. `${SEVEN_BREADTHS_BTLL}${RNC_BTLL}`) ───────────────
        if (isImportLine(raw))
            continue;
        // ── Continuation line (inside an unclosed bracket from a previous line) ───
        if (openDepth > 0) {
            const exprTokens = scanExpression(raw, lineIdx, indent, userDefinedNames);
            tokens.push(...exprTokens);
            openDepth = Math.max(0, openDepth + netDepthChange(raw, indent));
            continue;
        }
        // ── Full-line comment ──────────────────────────────────────────────────────
        if (trimmed.startsWith("//")) {
            tokens.push({
                line: lineIdx,
                colStart: indent,
                colEnd: raw.length,
                kind: "comment",
            });
            continue;
        }
        // ── Type token (first word, may include <…> and (…)) ──────────────────────
        const typeStart = indent;
        const typeEnd = findTypeEnd(raw, typeStart);
        if (typeEnd > typeStart) {
            tokens.push({
                line: lineIdx,
                colStart: typeStart,
                colEnd: typeEnd,
                kind: "type",
            });
        }
        // ── Variable / function name ───────────────────────────────────────────────
        let j = typeEnd;
        while (j < raw.length && raw[j] === " ")
            j++;
        const varnameStart = j;
        while (j < raw.length && /[a-zA-Z0-9_]/.test(raw[j]))
            j++;
        const varnameEnd = j;
        const varname = raw.slice(varnameStart, varnameEnd);
        if (varname) {
            const kind = KEYWORD_NAMES.has(varname) ? "keyword" : "identifier";
            tokens.push({
                line: lineIdx,
                colStart: varnameStart,
                colEnd: varnameEnd,
                kind,
            });
            // Track user-defined names (functions and variables) for later call sites.
            if (kind === "identifier")
                userDefinedNames.add(varname);
        }
        // ── Expression tokens (rest of the line) ──────────────────────────────────
        while (j < raw.length && raw[j] === " ")
            j++;
        const exprTokens = scanExpression(raw, lineIdx, j, userDefinedNames);
        tokens.push(...exprTokens);
        // Update depth for any brackets opened/closed in the expression.
        openDepth = Math.max(0, openDepth + netDepthChange(raw, j));
    }
    return tokens;
}
// ── Helpers ────────────────────────────────────────────────────────────────────
/**
 * Returns the net change in open-bracket depth for `line` starting at `col`.
 * Only `([{` / `)]}` are counted — angle brackets are excluded because they
 * appear inside type tokens and would give false positives.
 * String literals and line comments are respected.
 */
function netDepthChange(line, col) {
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = col; i < line.length; i++) {
        const ch = line[i];
        if (ch === "'" && !inDouble) {
            inSingle = !inSingle;
            continue;
        }
        if (ch === '"' && !inSingle) {
            inDouble = !inDouble;
            continue;
        }
        if (inSingle || inDouble)
            continue;
        if (ch === "/" && line[i + 1] === "/")
            break;
        if (ch === "(" || ch === "[" || ch === "{")
            depth++;
        else if (ch === ")" || ch === "]" || ch === "}")
            depth--;
    }
    return depth;
}
/**
 * Returns the column where the type token ends on `line` starting at `start`.
 * Stops at the first space that is not inside angle brackets or parentheses,
 * which correctly handles List<T>, Function<R>(A1, A2), etc.
 */
function findTypeEnd(line, start) {
    let depth = 0;
    let i = start;
    while (i < line.length) {
        const ch = line[i];
        if (ch === "<" || ch === "(")
            depth++;
        else if (ch === ">" || ch === ")")
            depth--;
        else if (ch === " " && depth === 0)
            return i;
        i++;
    }
    return i;
}
/**
 * Character-level scanner for the expression part of a BtLL statement.
 * Handles string literals, numbers, booleans, function calls, and brackets.
 */
function scanExpression(line, lineIdx, startCol, userDefined) {
    const tokens = [];
    let i = startCol;
    while (i < line.length) {
        const ch = line[i];
        // Skip whitespace and comma separators.
        if (ch === " " || ch === "\t" || ch === ",") {
            i++;
            continue;
        }
        // ── Inline comment ─────────────────────────────────────────────────────────
        if (ch === "/" && line[i + 1] === "/") {
            tokens.push({ line: lineIdx, colStart: i, colEnd: line.length, kind: "comment" });
            break;
        }
        // ── String literal ─────────────────────────────────────────────────────────
        if (ch === '"' || ch === "'") {
            let j = i + 1;
            while (j < line.length && line[j] !== ch) {
                if (line[j] === "\\")
                    j++; // skip backslash-escaped character
                j++;
            }
            const end = Math.min(j + 1, line.length);
            tokens.push({ line: lineIdx, colStart: i, colEnd: end, kind: "string" });
            i = end;
            continue;
        }
        // ── Numeric literal (optionally leading minus) ─────────────────────────────
        if (/\d/.test(ch) ||
            (ch === "-" && i + 1 < line.length && /\d/.test(line[i + 1]))) {
            let j = ch === "-" ? i + 1 : i;
            while (j < line.length && /[\d.]/.test(line[j]))
                j++;
            tokens.push({ line: lineIdx, colStart: i, colEnd: j, kind: "number" });
            i = j;
            continue;
        }
        // ── Identifier, keyword, builtin, or function call ─────────────────────────
        if (/[a-zA-Z_]/.test(ch)) {
            let j = i;
            while (j < line.length && /[a-zA-Z0-9_]/.test(line[j]))
                j++;
            const word = line.slice(i, j);
            // Peek past whitespace to detect a call site: name( or name<
            let k = j;
            while (k < line.length && line[k] === " ")
                k++;
            const isCallSite = k < line.length && (line[k] === "(" || line[k] === "<");
            let kind;
            if (BOOLEAN_LITERALS.has(word)) {
                kind = "boolean";
            }
            else if (isCallSite) {
                kind = BUILTIN_SET.has(word) ? "builtin" : "user-func";
            }
            else if (KEYWORD_NAMES.has(word)) {
                kind = "keyword";
            }
            else {
                kind = "identifier";
            }
            tokens.push({ line: lineIdx, colStart: i, colEnd: j, kind });
            i = j;
            continue;
        }
        // ── Brackets ───────────────────────────────────────────────────────────────
        if ("()[]{}".includes(ch)) {
            tokens.push({ line: lineIdx, colStart: i, colEnd: i + 1, kind: "bracket" });
            i++;
            continue;
        }
        // Everything else (angle brackets, semicolons, etc.) — skip.
        i++;
    }
    return tokens;
}
//# sourceMappingURL=tokenizer.js.map