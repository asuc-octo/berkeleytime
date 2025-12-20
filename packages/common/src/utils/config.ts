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
  cacheWarmingPort: number;
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
  s3Endpoint: string;
  s3Port: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3StaffPhotosBucket: string;
}

// All your secrets, keys go here
export const config: Config = {
  port: +env("PORT"),
  cacheWarmingPort: +env("CACHE_WARMING_PORT"),
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
  s3Endpoint: env("S3_ENDPOINT"),
  s3Port: env("S3_PORT"),
  s3AccessKeyId: env("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: env("S3_SECRET_ACCESS_KEY"),
  s3StaffPhotosBucket: env("S3_STAFF_PHOTOS_BUCKET"),
};
