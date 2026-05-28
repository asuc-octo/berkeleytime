import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// Recharts imports `react-is`; resolution can fail under esbuild when deps are hoisted
// to the monorepo root (e.g. Docker + turbo prune). Resolve the real install path.
const reactIsRoot = dirname(require.resolve("react-is/package.json"));
const devPortPrefix = process.env.DEV_PORT_PREFIX ?? "30";
const apiProxyTarget =
  process.env.FRONTEND_API_PROXY_TARGET ??
  `http://localhost:${devPortPrefix}00`;

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["frontend", "localhost", ".localhost"],
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ["react-is", "recharts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "react-is": reactIsRoot,
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
