import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 3001,
    allowedHosts: ["ag-frontend"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});
