module.exports = {
  useTabs: false,
  experimentalBabelParserPluginsList: ["classProperties", "jsx"],
  printWidth: 80,
  tabWidth: 2,
  singleQuote: false,
  jsxBracketSameLine: false,
  importOrder: ["#src/env", "^[a-zA-Z]", "#src", "^@[a-zA-Z]", "^[./]"],
  importOrderSeparation: true,
  semi: false,
}
