import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// Some deps resolve to the monorepo root node_modules (e.g. Docker + turbo prune).
// Explicitly resolve their paths so esbuild can find them regardless of hoisting.
// Note: some packages don't export "./package.json", so we resolve the main entry
// and slice back to the package root directory instead.
function resolvePackageRoot(packageName: string): string {
  const entry = require.resolve(packageName);
  const marker = `/node_modules/${packageName}`;
  const idx = entry.lastIndexOf(marker);
  return idx !== -1 ? entry.slice(0, idx + marker.length) : dirname(entry);
}
const reactIsRoot = dirname(require.resolve("react-is/package.json"));
const otelApiRoot = resolvePackageRoot("@opentelemetry/api");
const otelApiLogsRoot = resolvePackageRoot("@opentelemetry/api-logs");
const shimmerRoot = resolvePackageRoot("shimmer");

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["frontend", "localhost", ".localhost"],
  },
  optimizeDeps: {
    include: [
      "react-is",
      "recharts",
      "@opentelemetry/api",
      "@opentelemetry/api-logs",
      "@opentelemetry/auto-instrumentations-web",
      "@opentelemetry/context-zone",
      "@opentelemetry/exporter-trace-otlp-http",
      "@opentelemetry/instrumentation",
      "@opentelemetry/resources",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/sdk-trace-web",
    ],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "react-is": reactIsRoot,
      "@opentelemetry/api": otelApiRoot,
      "@opentelemetry/api-logs": otelApiLogsRoot,
      shimmer: shimmerRoot,
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
