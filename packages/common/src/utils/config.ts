import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

/** Resolve monorepo root (directory containing turbo.json). */
function monorepoRoot(): string | undefined {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(path.join(dir, "turbo.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
}

/**
 * Load .env without relying on process.cwd(): Turbo may run with cwd /backend.
 * Docker mounts repo .env at <monorepo>/.env (e.g. /backend/.env), not under apps/backend/ (avoids nested bind issues on Docker Desktop).
 */
function loadEnvFiles(): void {
  const root = monorepoRoot();
  if (root) {
    const rootEnv = path.join(root, ".env");
    const backendEnv = path.join(root, "apps", "backend", ".env");
    if (existsSync(rootEnv)) {
      dotenv.config({ path: rootEnv });
    }
    if (existsSync(backendEnv)) {
      dotenv.config({ path: backendEnv });
    }
  }
  dotenv.config();
}

loadEnvFiles();

// Safely get the environment variable in the process
const env = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

const envOptional = (name: string): string | undefined => process.env[name];

export interface Config {
  port: number;
  cacheWarmingPort: number;
  url: string;
  backendPath: string;
  /** Full public URL of the backend (e.g. https://berkeleytime.com/api). Required in production for OAuth callback. */
  backendPublicUrl: string | undefined;
  graphqlPath: string;
  isDev: boolean;
  semanticSearch: {
    url: string;
  };
  mongoDB: {
    uri: string;
  };
  sis: {
    CLASS_APP_ID: string;
    CLASS_APP_KEY: string;
    COURSE_APP_ID: string;
    COURSE_APP_KEY: string;
    TERM_APP_ID: string;
    TERM_APP_KEY: string;
  };
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  redisUri: string;
  s3: {
    imagesAccessUrl: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

// All your secrets, keys go here
export const config: Config = {
  port: +env("PORT"),
  cacheWarmingPort: +env("CACHE_WARMING_PORT"),
  url: env("URL"),
  backendPath: env("BACKEND_PATH"),
  backendPublicUrl: envOptional("BACKEND_PUBLIC_URL"),
  graphqlPath: env("GRAPHQL_PATH"),
  isDev: env("NODE_ENV") === "development",
  semanticSearch: {
    url: env("SEMANTIC_SEARCH_URL"),
  },
  mongoDB: {
    uri: env("MONGODB_URI"),
  },
  sis: {
    CLASS_APP_ID: env("SIS_CLASS_APP_ID"),
    CLASS_APP_KEY: env("SIS_CLASS_APP_KEY"),
    COURSE_APP_ID: env("SIS_COURSE_APP_ID"),
    COURSE_APP_KEY: env("SIS_COURSE_APP_KEY"),
    TERM_APP_ID: env("SIS_TERM_APP_ID"),
    TERM_APP_KEY: env("SIS_TERM_APP_KEY"),
  },
  SESSION_SECRET: env("SESSION_SECRET"),
  GOOGLE_CLIENT_ID: env("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: env("GOOGLE_CLIENT_SECRET"),
  redisUri: env("REDIS_URI"),
  s3: {
    imagesAccessUrl: env("S3_IMAGES_ACCESS_URL"),
    endpoint: env("S3_ENDPOINT"),
    accessKeyId: env("S3_ACCESS_KEY_ID"),
    secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
  },
};
