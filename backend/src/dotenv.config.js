import dotenv from "dotenv";
dotenv.config({
  path: `${
    new URL(`../.env.${process.env.NODE_ENV}`, import.meta.url).pathname
  }`,
});
