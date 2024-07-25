/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "@repo/eslint-config/index.cjs",
    "plugin:react-hooks/recommended",
    "plugin:cypress/recommended",
  ],
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
