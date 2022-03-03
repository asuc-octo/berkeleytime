import dotenv from "dotenv";
import { dirname } from "path";

const envFile = `.env.${process.env.NODE_ENV ?? "dev"}`;
const currentDir = dirname(dirname(new URL(import.meta.url).pathname));
const path = `${currentDir}/${envFile}`;
dotenv.config({
  path,
});
