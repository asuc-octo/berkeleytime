# BtLL Linter — VS Code / Cursor Extension

Provides syntax highlighting, inline error diagnostics, and hover info for
**Berkeleytime Logical Language (BtLL)** code embedded in TypeScript, JavaScript,
and Python string literals.

## Features

- Syntax highlighting for BtLL keywords, types, builtins, strings, numbers, and comments
- Real-time error and warning diagnostics (invalid types, missing `main`, unbalanced brackets, …)
- Hover tooltips showing parsed statement structure and per-line diagnostics
- Resilient to `${…}` template-literal imports that inject external BtLL modules

## Installing permanently into VS Code or Cursor

### 1. Build the extension

```bash
cd btll-linter
npm install        # only needed once
npm run compile    # compiles TypeScript → out/
```

### 2. Package as a `.vsix` file

```bash
npx vsce package
```

This produces `btll-linter-<version>.vsix` in the current directory.

> **Tip:** if you skip step 1, `vsce package` runs `npm run compile` automatically
> via the `vscode:prepublish` script.

### 3. Install the `.vsix` into your editor

**Cursor / VS Code**

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run **Extensions: Install from VSIX…**
3. Select the `.vsix` file you just built.

The extension activates automatically for `.ts`, `.tsx`, `.js`, `.jsx`, and
`.py` files that contain a BtLL code block.

## Writing a BtLL block

Wrap your BtLL code in a tagged template literal (TypeScript/JavaScript) or a
triple-quoted string (Python) and start the content with `// BtLL`:

```typescript
const myRequirement = `
// BtLL
${SOME_IMPORTED_MODULE}
Function<boolean>() main () {
  List<Course> courses get_attr(this, "allCourses")
  boolean return true
}
`;
```

The linter recognises lines consisting entirely of `${…}` interpolations as
external module imports and skips them without raising errors.

## Development

```bash
npm run watch   # recompile on every save
```

Open the `btll-linter` folder in VS Code and press **F5** to launch an
Extension Development Host with the linter active.
