module.exports = {
  useTabs: false,
  experimentalBabelParserPluginsList: ["classProperties", "jsx"],
  printWidth: 80,
  tabWidth: 2,
  singleQuote: false,
  jsxBracketSameLine: false,
  importOrder: ["^.*dotenv.*", "^[a-zA-Z]", "#node", "^@[a-zA-Z]", "^[./]"],
  importOrderSeparation: true,
  semi: false
}
