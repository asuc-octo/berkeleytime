import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const reactIsRoot = dirname(require.resolve("react-is/package.json"));

export default defineConfig({
  server: {
    host: true,
    port: 3002,
    allowedHosts: ["staff-frontend"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "react-is": reactIsRoot,
    },
  },
  optimizeDeps: {
    include: ["react-is", "recharts"],
  },
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});
