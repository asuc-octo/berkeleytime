import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import cssModulesPlugin from "eslint-plugin-css-modules";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import ts from "typescript-eslint";

/** @type { import("eslint").Linter.Config[] } */
export const backendConfig = [
  { ignores: ["**/generated-types/**", "**/generated-typedefs/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ["**/*.ts"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];

/** @type { import("eslint").Linter.Config[] } */
export const datapullerConfig = [
  { ignores: ["**/generated-types/**", "**/generated-typedefs/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ["**/*.ts"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

/** @type { import("eslint").Linter.Config[] } */
export const frontendConfig = [
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      "css-modules": cssModulesPlugin,
      "react-refresh": reactRefreshPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      "css-modules/no-unused-class": [2, { camelCase: "only" }],
      "css-modules/no-undef-class": [2, { camelCase: "only" }],
    },
  },
];
