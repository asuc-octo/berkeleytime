import dotenv from "dotenv";

dotenv.config();
console.log(process.cwd());
console.log("PORT:", process.env.PORT);

// Safely get the environment variable in the process
const env = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export interface Config {
  port: number;
  url: string;
  backendPath: string;
  graphqlPath: string;
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
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  redisUri: string;
}

// All your secrets, keys go here
export const config: Config = {
  port: +env("PORT"),
  url: env("URL"),
  backendPath: env("BACKEND_PATH"),
  graphqlPath: env("GRAPHQL_PATH"),
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
  SESSION_SECRET: env("SESSION_SECRET"),
  GOOGLE_CLIENT_ID: env("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: env("GOOGLE_CLIENT_SECRET"),
  redisUri: env("REDIS_URI"),
};
