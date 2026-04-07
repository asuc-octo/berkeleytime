import express from "express";
import http from "http";

import { Config } from "../../../../packages/common/src/utils/config";
import loaders from "./loaders";

export default async (config: Config) => {
  const app = express();
  app.set("trust proxy", 1);
  app.get("/healthz", (_, res) => {
    res.status(200).send("OK");
  });

  await loaders(app);

  const httpServer = http.createServer(app);

  httpServer.listen(config.port);

  console.log(
    `🚀\tServer ready (in Docker network) at:\thttp://localhost:${config.port}${config.backendPath}`
  );

  console.log(
    `\tServer ready (in Host network) at:\thttp://localhost:3000${config.backendPath}`
  );
};
