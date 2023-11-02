import dotenv from "dotenv";
dotenv.config();

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
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  S3_ENDPOINT: string,
  S3_PORT: number,
  S3_ACCESS_KEY_ID: string,
  S3_SECRET_ACCESS_KEY: string,
  S3_MONGO_BACKUP_BUCKET: string,
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
  SESSION_SECRET: env("SESSION_SECRET"),
  GOOGLE_CLIENT_ID: env("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: env("GOOGLE_CLIENT_SECRET"),
  S3_ENDPOINT: env("S3_ENDPOINT"),
  S3_PORT: parseInt(env("S3_PORT")),
  S3_ACCESS_KEY_ID: env("S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: env("S3_SECRET_ACCESS_KEY"),
  S3_MONGO_BACKUP_BUCKET: env("S3_MONGO_BACKUP_BUCKET"),
};
