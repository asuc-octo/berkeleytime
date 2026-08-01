import dotenv from "dotenv";
import { Logger } from "tslog";

// Safely get the environment variable in the process
const env = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export interface Config {
  log: Logger<unknown>;
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
  aws: {
    DATABASE: string;
    S3_OUTPUT: string;
    REGION_NAME: string;
    WORKGROUP: string;
  };
  BACKEND_URL: string;
  SEMANTIC_SEARCH_URL: string;
  email?: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
}

export function loadConfig(): Config {
  dotenv.config();

  const log = new Logger({
    type: "pretty",
    prettyLogTimeZone: "local",
  });

  log.trace("Loading config...");

  return {
    log,
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
    aws: {
      DATABASE: env("AWS_DATABASE"),
      S3_OUTPUT: env("AWS_S3_OUTPUT"),
      REGION_NAME: env("AWS_REGION_NAME"),
      WORKGROUP: env("AWS_WORKGROUP"),
    },
    BACKEND_URL: env("BACKEND_URL"),
    SEMANTIC_SEARCH_URL: env("SEMANTIC_SEARCH_URL"),
    email: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT ?? "587"),
          user: process.env.SMTP_USER ?? "",
          password: process.env.SMTP_PASSWORD ?? "",
          from: process.env.SMTP_FROM ?? "",
        }
      : undefined,
  };
}
