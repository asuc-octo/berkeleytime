# @repo/eslint-config

The `@repo/eslint-config` package provides shared ESLint configuration for all applications and packages in the monorepo.

## Local Development

This package is used as a dev dependency. No build step is required.

## Structure

```
packages/eslint-config/
├── index.mjs             # Main configuration file
└── package.json
```

## Usage

Reference the config in your app's `eslint.config.mjs`:

```javascript
import baseConfig from "@repo/eslint-config";

export default [
  ...baseConfig,
  // Add app-specific overrides here
];
```

## Included Rules

The configuration includes:

| Plugin | Purpose |
|--------|---------|
| `@eslint/js` | Core JavaScript rules |
| `typescript-eslint` | TypeScript-specific rules |
| `eslint-config-prettier` | Disables formatting rules (handled by Prettier) |
| `eslint-plugin-react-hooks` | React Hooks rules |
| `eslint-plugin-react-refresh` | React Fast Refresh compatibility |
| `eslint-plugin-css-modules` | CSS Modules best practices |

## IDE Integration

For the best development experience, install the ESLint extension:

- **VSCode**: [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

This enables real-time linting and auto-fix on save.

## Running Lint

```bash
# Lint a specific app
cd apps/frontend && npm run lint

# Lint the entire monorepo
npm run lint
```
