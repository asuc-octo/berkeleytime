import dotenv from "dotenv";
import path from "path";

const envFile = `.env.${process.env.NODE_ENV || "dev"}`; // gsutil cp gs://berkeleytime-218606/secrets/.env.dev.ts .env.dev

dotenv.config({
  path: path.resolve(process.cwd(), envFile), // process.cwd() assumes calling process takes place from project root
});
