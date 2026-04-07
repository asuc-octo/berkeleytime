import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let reactIsRoot: string | null = null;
try {
  // In some Docker + turbo prune installs, `react-is` may not be hoisted to the
  // app/root node_modules. Only alias it when we can resolve a concrete path.
  reactIsRoot = dirname(require.resolve("react-is/package.json"));
} catch {
  reactIsRoot = null;
}

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
      ...(reactIsRoot ? { "react-is": reactIsRoot } : {}),
    },
  },
  optimizeDeps: {
    include: reactIsRoot ? ["react-is"] : [],
  },
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});