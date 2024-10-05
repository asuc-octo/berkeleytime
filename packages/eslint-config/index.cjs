/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:css-modules/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "css-modules",
    "react-refresh",
    "react-hooks",
  ],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "css-modules/no-unused-class": [2, { camelCase: "only" }],
    "css-modules/no-undef-class": [2, { camelCase: "only" }],
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
};
