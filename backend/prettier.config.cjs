module.exports = {
  useTabs: false,
  experimentalBabelParserPluginsList: ["topLevelAwait", "classProperties"], // required until https://github.com/babel/babel/pull/13387 is merged
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  jsxBracketSameLine: false,
  importOrder: ["#src/env", "^[a-zA-Z]", "#src", "^@[a-zA-Z]", "^[./]"],
  jsonRecursiveSort: true,
  importOrderSeparation: true,
  semi: true,
};
