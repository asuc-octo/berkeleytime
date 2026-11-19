import * as vscode from "vscode";

import { BtLLDiagnostic, lintBtLL, parseBtLLLine } from "./linter";
import { BtLLToken, TokenKind, tokenizeBtLL } from "./tokenizer";

// ── Supported host languages ───────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "typescriptreact",
  "javascriptreact",
  "python",
]);

const LANGUAGE_SELECTOR: vscode.DocumentSelector = [
  { language: "typescript" },
  { language: "javascript" },
  { language: "typescriptreact" },
  { language: "javascriptreact" },
  { language: "python" },
];

// ── Location type shared by linting, decorating, and hovering ─────────────────

interface BtLLLocation {
  /** Document line containing the "BtLL" marker keyword. */
  markerLine: number;
  /** First document line of the actual BtLL code (line after the marker). */
  startLine: number;
  /** Raw BtLL code text (everything after the marker line). */
  content: string;
}

// ── Per-document cache ─────────────────────────────────────────────────────────

interface DocCache {
  locations: BtLLLocation[];
  diagnostics: Map<number, BtLLDiagnostic[]>; // keyed by btll lineOffset
}

const docCache = new Map<string, DocCache>();

// ── Decoration types (created once, reused for every editor) ──────────────────
// Colors are tuned for VS Code's default dark theme; light-theme alternates
// are specified via the `light` key so both themes look reasonable.

function makeDecoration(
  dark: string,
  light: string,
  extra?: Partial<vscode.DecorationRenderOptions>
): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    dark: { color: dark },
    light: { color: light },
    ...extra,
  });
}

const DECORATIONS: Record<
  TokenKind | "marker",
  vscode.TextEditorDecorationType
> = {
  marker: makeDecoration("#569CD6", "#0070C1", { fontWeight: "bold" }),
  type: makeDecoration("#4EC9B0", "#267F99"),
  keyword: makeDecoration("#C586C0", "#AF00DB", { fontWeight: "bold" }),
  builtin: makeDecoration("#DCDCAA", "#795E26"),
  "user-func": makeDecoration("#9CDCFE", "#0070C1"),
  string: makeDecoration("#CE9178", "#A31515"),
  number: makeDecoration("#B5CEA8", "#098658"),
  boolean: makeDecoration("#569CD6", "#0000FF"),
  comment: makeDecoration("#6A9955", "#008000", { fontStyle: "italic" }),
  bracket: makeDecoration("#FFD700", "#B8860B"),
  identifier: makeDecoration("#9CDCFE", "#001080"),
};

// ── Activation / deactivation ──────────────────────────────────────────────────

let diagnosticCollection: vscode.DiagnosticCollection;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

export function activate(context: vscode.ExtensionContext): void {
  diagnosticCollection = vscode.languages.createDiagnosticCollection("btll");
  context.subscriptions.push(diagnosticCollection);

  // Register hover provider for all supported languages.
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE_SELECTOR, { provideHover })
  );

  // Process already-open editors.
  vscode.window.visibleTextEditors.forEach((e) => processEditor(e));

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      const editor = vscode.window.visibleTextEditors.find(
        (e) => e.document === doc
      );
      if (editor) processEditor(editor);
    }),

    vscode.workspace.onDidChangeTextDocument((e) => {
      const editor = vscode.window.visibleTextEditors.find(
        (ed) => ed.document === e.document
      );
      if (!editor) return;
      // Debounce so we don't fire on every keystroke.
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => processEditor(editor), 200);
    }),

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) processEditor(editor);
    }),

    vscode.window.onDidChangeVisibleTextEditors((editors) => {
      editors.forEach((e) => processEditor(e));
    }),

    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
      docCache.delete(doc.uri.toString());
    })
  );
}

export function deactivate(): void {
  diagnosticCollection.clear();
  docCache.clear();
  if (debounceTimer) clearTimeout(debounceTimer);
}

// ── Core pipeline: find → lint → decorate ─────────────────────────────────────

function processEditor(editor: vscode.TextEditor): void {
  const doc = editor.document;
  if (!SUPPORTED_LANGUAGES.has(doc.languageId)) return;

  const text = doc.getText();
  const isTS = doc.languageId !== "python";

  const locations = isTS
    ? findBtLLInTemplateLiterals(text)
    : findBtLLInPythonStrings(text);

  // ── Lint ──────────────────────────────────────────────────────────────────────
  const allVsDiagnostics: vscode.Diagnostic[] = [];
  const diagByLine = new Map<number, BtLLDiagnostic[]>();

  for (const loc of locations) {
    const btllDiags = lintBtLL(loc.content);

    for (const d of btllDiags) {
      const bucket = diagByLine.get(d.lineOffset) ?? [];
      bucket.push(d);
      diagByLine.set(d.lineOffset, bucket);
      allVsDiagnostics.push(toVscodeDiagnostic(doc, loc.startLine, d));
    }
  }

  diagnosticCollection.set(doc.uri, allVsDiagnostics);
  docCache.set(doc.uri.toString(), { locations, diagnostics: diagByLine });

  // ── Decorate ──────────────────────────────────────────────────────────────────
  updateDecorations(editor, locations);
}

// ── Decoration update ──────────────────────────────────────────────────────────

function updateDecorations(
  editor: vscode.TextEditor,
  locations: BtLLLocation[]
): void {
  const doc = editor.document;

  // Collect ranges for each decoration kind.
  const rangeMap = new Map<TokenKind | "marker", vscode.Range[]>(
    (Object.keys(DECORATIONS) as Array<TokenKind | "marker">).map((k) => [
      k,
      [],
    ])
  );

  for (const loc of locations) {
    // Highlight the "BtLL" marker word itself.
    const markerDocLine = loc.markerLine;
    if (markerDocLine < doc.lineCount) {
      const markerLineText = doc.lineAt(markerDocLine).text;
      const markerIdx = markerLineText.indexOf("BtLL");
      if (markerIdx >= 0) {
        rangeMap
          .get("marker")!
          .push(
            new vscode.Range(
              markerDocLine,
              markerIdx,
              markerDocLine,
              markerIdx + 4
            )
          );
      }
    }

    // Tokenize the BtLL code and map each token back to a document range.
    const tokens = tokenizeBtLL(loc.content);
    for (const tok of tokens) {
      const docLine = loc.startLine + tok.line;
      if (docLine >= doc.lineCount) continue;

      const lineLen = doc.lineAt(docLine).text.length;
      const start = Math.min(tok.colStart, lineLen);
      const end = Math.min(tok.colEnd, lineLen);
      if (start >= end) continue;

      rangeMap
        .get(tok.kind)
        ?.push(new vscode.Range(docLine, start, docLine, end));
    }
  }

  // Apply (or clear) each decoration type.
  for (const [kind, decType] of Object.entries(DECORATIONS) as Array<
    [TokenKind | "marker", vscode.TextEditorDecorationType]
  >) {
    editor.setDecorations(decType, rangeMap.get(kind) ?? []);
  }
}

// ── Hover provider ─────────────────────────────────────────────────────────────

function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Hover | null {
  if (!SUPPORTED_LANGUAGES.has(document.languageId)) return null;

  const cached = docCache.get(document.uri.toString());
  if (!cached) return null;

  for (const loc of cached.locations) {
    // Check if the cursor is on the marker line.
    if (position.line === loc.markerLine) {
      const md = new vscode.MarkdownString(undefined, true);
      md.supportThemeIcons = true;
      md.appendMarkdown("### BtLL Code Block\n\n");
      md.appendMarkdown(
        "Berkeleytime Logical Language embedded in this string.\n\n"
      );

      const errorCount = [...cached.diagnostics.values()]
        .flat()
        .filter((d) => d.severity === "error").length;
      const warnCount = [...cached.diagnostics.values()]
        .flat()
        .filter((d) => d.severity === "warning").length;

      if (errorCount > 0) {
        md.appendMarkdown(
          `$(error) **${errorCount} error${errorCount > 1 ? "s" : ""}**   `
        );
      }
      if (warnCount > 0) {
        md.appendMarkdown(
          `$(warning) **${warnCount} warning${warnCount > 1 ? "s" : ""}**`
        );
      }
      if (errorCount === 0 && warnCount === 0) {
        md.appendMarkdown("$(check) No issues found.");
      }

      return new vscode.Hover(md);
    }

    // Check if the cursor is inside the BtLL code block.
    const btllLine = position.line - loc.startLine;
    const lines = loc.content.split("\n");
    if (btllLine < 0 || btllLine >= lines.length) continue;

    const md = new vscode.MarkdownString(undefined, true);
    md.supportThemeIcons = true;
    md.isTrusted = true;

    const rawLine = lines[btllLine];
    const trimmed = rawLine.trim();

    if (trimmed === "" || trimmed.startsWith("//")) {
      // Don't show hover for blank or comment-only lines.
      continue;
    }

    // Show parsed statement breakdown.
    const [type, varname, expr] = parseBtLLLine(lines, btllLine);
    if (type || varname) {
      md.appendMarkdown("**BtLL statement**\n\n");
      const exprPreview = expr.length > 60 ? expr.slice(0, 57) + "…" : expr;
      md.appendCodeblock(`${type}  ${varname}  ${exprPreview}`, "");
    }

    // Show diagnostics for this line.
    const lineDiags = cached.diagnostics.get(btllLine) ?? [];
    if (lineDiags.length > 0) {
      md.appendMarkdown("\n---\n");
      for (const d of lineDiags) {
        const icon = d.severity === "error" ? "$(error)" : "$(warning)";
        md.appendMarkdown(`\n${icon} ${d.message}\n`);
      }
    }

    return new vscode.Hover(md);
  }

  return null;
}

// ── Diagnostic conversion ──────────────────────────────────────────────────────

function toVscodeDiagnostic(
  document: vscode.TextDocument,
  btllStartLine: number,
  diag: BtLLDiagnostic
): vscode.Diagnostic {
  const docLine = Math.min(
    btllStartLine + diag.lineOffset,
    document.lineCount - 1
  );
  const lineLen = document.lineAt(docLine).text.length;
  const colStart = Math.min(diag.colStart, lineLen);
  const colEnd = Math.min(Math.max(diag.colEnd, colStart + 1), lineLen);

  const range = new vscode.Range(docLine, colStart, docLine, colEnd);
  const severity =
    diag.severity === "error"
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning;

  const d = new vscode.Diagnostic(range, diag.message, severity);
  d.source = "btll";
  return d;
}

// ── BtLL string discovery ──────────────────────────────────────────────────────

function buildLineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") starts.push(i + 1);
  }
  return starts;
}

function offsetToLine(lineStarts: number[], offset: number): number {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    if (lineStarts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Detects the BtLL marker in the content of a string literal.
 *
 * Accepts two forms on the first non-empty line:
 *   BtLL              (bare marker)
 *   // BtLL           (comment marker — e.g. export const X = `\n// BtLL\n...`)
 *
 * Returns the offset of the "BtLL" word itself (used for markerLine) and
 * the offset where the actual BtLL code begins (line after the marker).
 */
function detectBtLLMarker(
  content: string
): { btllOffset: number; codeOffset: number } | null {
  const firstNonSpace = content.search(/\S/);
  if (firstNonSpace === -1) return null;

  const slice = content.slice(firstNonSpace);

  let btllInSlice: number;
  let markerLen: number;

  if (slice.startsWith("BtLL")) {
    // Bare: `BtLL\n...`
    btllInSlice = 0;
    markerLen = 4;
  } else {
    // Comment: `// BtLL\n...` or `//BtLL\n...`
    const m = slice.match(/^\/\/\s*BtLL/);
    if (!m) return null;
    btllInSlice = m[0].indexOf("BtLL");
    markerLen = m[0].length;
  }

  const newlineAfterMarker = content.indexOf("\n", firstNonSpace + markerLen);
  if (newlineAfterMarker === -1) return null; // no code after marker

  return {
    btllOffset: firstNonSpace + btllInSlice,
    codeOffset: newlineAfterMarker + 1,
  };
}

/**
 * Scans a TypeScript/JavaScript file for backtick template literals that
 * contain a BtLL marker on the first non-empty line.
 *
 * Accepted patterns:
 *   `BtLL\n<code>`
 *   `\n// BtLL\n<code>`
 */
function findBtLLInTemplateLiterals(text: string): BtLLLocation[] {
  const results: BtLLLocation[] = [];
  const lineStarts = buildLineStarts(text);
  let i = 0;

  while (i < text.length) {
    if (text[i] !== "`") {
      i++;
      continue;
    }

    i++; // skip opening backtick
    const contentStart = i;

    // Scan to closing backtick, honouring backslash escapes.
    while (i < text.length && text[i] !== "`") {
      if (text[i] === "\\" && i + 1 < text.length) i += 2;
      else i++;
    }
    const contentEnd = i;
    if (i < text.length) i++; // skip closing backtick

    const content = text.slice(contentStart, contentEnd);
    const marker = detectBtLLMarker(content);
    if (!marker) continue;

    const markerLine = offsetToLine(
      lineStarts,
      contentStart + marker.btllOffset
    );
    const codeOffset = contentStart + marker.codeOffset;
    const btllStartLine = offsetToLine(lineStarts, codeOffset);

    results.push({
      markerLine,
      startLine: btllStartLine,
      content: content.slice(marker.codeOffset),
    });
  }

  return results;
}

/**
 * Scans Python files for triple-quoted strings (""" or ''') that contain a
 * BtLL marker on the first non-empty line (bare "BtLL" or "# BtLL" comment).
 */
function findBtLLInPythonStrings(text: string): BtLLLocation[] {
  const results: BtLLLocation[] = [];
  const lineStarts = buildLineStarts(text);

  for (const delim of ['"""', "'''"]) {
    let pos = 0;
    while (pos < text.length) {
      const openIdx = text.indexOf(delim, pos);
      if (openIdx === -1) break;

      const contentStart = openIdx + 3;
      const closeIdx = text.indexOf(delim, contentStart);
      if (closeIdx === -1) break;

      const content = text.slice(contentStart, closeIdx);
      const marker = detectBtLLMarker(content);
      if (marker) {
        results.push({
          markerLine: offsetToLine(
            lineStarts,
            contentStart + marker.btllOffset
          ),
          startLine: offsetToLine(lineStarts, contentStart + marker.codeOffset),
          content: content.slice(marker.codeOffset),
        });
      }

      pos = closeIdx + 3;
    }
  }

  return results;
}
