module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['react'],
  rules: {
    "no-labels": "off",
    "no-console": "warn",
    "no-else-return": "off",
    "no-param-reassign": "off",
    "prefer-destructuring": "off",
    "radix": "off",
    "react/prop-types": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-one-expression-per-line": "off"
  },
  ignorePatterns: ['build', '**/*.js', '**/*.json', 'node_modules'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
