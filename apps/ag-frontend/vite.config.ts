import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    port: 3001,
    allowedHosts: ["ag-frontend"],
    proxy: {
      "/api/graphql": {
        target: "http://localhost:8080", // your backend port
        changeOrigin: true,
        secure: false,
      },
    },
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
