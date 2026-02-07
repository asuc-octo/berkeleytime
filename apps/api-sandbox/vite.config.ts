import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

// Parse .env file manually to get SIS credentials
function loadEnvFile(): Record<string, string> {
  const envPath = resolve(__dirname, "../../.env");
  const env: Record<string, string> = {};

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  }

  return env;
}

const envFile = loadEnvFile();

// Get env var from process.env (Docker) or .env file
const getEnv = (key: string) => process.env[key] || envFile[key] || "";

export default defineConfig({
  server: {
    host: true,
    port: 3009,
    allowedHosts: ["api-sandbox"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
  define: {
    // Inject SIS API credentials at build time
    // These are only used for local development
    __SIS_CLASS_APP_ID__: JSON.stringify(getEnv("SIS_CLASS_APP_ID")),
    __SIS_CLASS_APP_KEY__: JSON.stringify(getEnv("SIS_CLASS_APP_KEY")),
    __SIS_COURSE_APP_ID__: JSON.stringify(getEnv("SIS_COURSE_APP_ID")),
    __SIS_COURSE_APP_KEY__: JSON.stringify(getEnv("SIS_COURSE_APP_KEY")),
    __SIS_TERM_APP_ID__: JSON.stringify(getEnv("SIS_TERM_APP_ID")),
    __SIS_TERM_APP_KEY__: JSON.stringify(getEnv("SIS_TERM_APP_KEY")),
  },
});
