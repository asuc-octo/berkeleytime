import express from "express";
import http from "http";

import { Config } from "../config";
import loaders from "./loaders";

export default async (config: Config) => {
  // const t: Number[] = [];
  // console.log(t[0]);

  const app = express();
  app.set("trust proxy", 1);

  await loaders(app);

  const httpServer = http.createServer(app);

  httpServer.listen(config.port);

  console.log(
    `🚀\tServer ready (in Docker network) at:\thttp://localhost:${config.port}${config.backendPath}`
  );

  console.log(
    `\tServer ready (in Host network) at:\thttp://localhost:8080${config.backendPath}`
  );
};
