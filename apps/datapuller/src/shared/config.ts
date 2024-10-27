import dotenv from "dotenv";

// Safely get the environment variable in the process
const env = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export interface Config {
  isDev: boolean;
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
}

export function loadConfig(): Config {
  dotenv.config();

  return {
    isDev: env("NODE_ENV") === "development",
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
  };
}
