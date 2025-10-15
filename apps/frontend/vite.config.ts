import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["frontend"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    // TODO: Not really necessary for now, but could be useful for restrictions later
    // react({
    //   babel: {
    //     plugins: [["babel-plugin-react-compiler"]],
    //   },
    // }),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});
