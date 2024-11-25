import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";


export default defineConfig({
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});