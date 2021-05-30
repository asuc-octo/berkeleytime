import alias from "@rollup/plugin-alias";
module.exports = {
  input: "server/src/_index.js",
  plugins: [
    alias({
      entries: [
        {
          find: "#node",
          replacement: new URL(`src`, import.meta.url).pathname,
        },
      ],
    }),
  ],
};
