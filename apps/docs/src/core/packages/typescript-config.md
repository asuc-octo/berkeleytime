# @repo/typescript-config

The `@repo/typescript-config` package provides shared TypeScript configuration presets for all applications and packages in the monorepo.

## Local Development

This package is used as a dev dependency. No build step is required.

## Structure

```
packages/typescript-config/
├── base.json             # Base configuration (shared settings)
├── node.json             # Node.js applications (backend, datapuller)
├── react.json            # React applications (deprecated, use vite.json)
├── vite.json             # Vite + React applications (frontend)
└── package.json
```

## Usage

Extend the appropriate config in your app's `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

## Available Configs

| Config | Use Case |
|--------|----------|
| `base.json` | Shared settings inherited by all configs |
| `node.json` | Backend services and Node.js packages |
| `vite.json` | Vite-based React applications |
| `react.json` | Legacy React config (prefer `vite.json`) |

## Base Configuration

The base config includes settings for:

- **Strict Type Checking**: Enables strict mode and additional checks
- **Module Resolution**: Uses bundler-style resolution
- **Interop**: Enables ES module interoperability
- **CSS Modules**: Includes plugin for CSS module type support

## Included Plugins

| Plugin | Purpose |
|--------|---------|
| `typescript-plugin-css-modules` | Provides type definitions for CSS module imports |

This plugin enables autocomplete and type checking for SCSS/CSS module classes:

```typescript
import styles from "./Component.module.scss";

// TypeScript knows about available class names
<div className={styles.container} />
```

## IDE Integration

For full TypeScript support, ensure your IDE uses the workspace TypeScript version:

- **VSCode**: The workspace is configured to use the local TypeScript version automatically
