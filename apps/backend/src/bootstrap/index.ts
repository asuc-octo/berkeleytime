import express, { json } from "express";
import http from "http";

import { Config } from "../../../../packages/common/src/utils/config";
import cacheRoutes from "../modules/cache/routes";
import loaders, { loadCacheWarmingDependencies } from "./loaders";

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
    `\tServer ready (in Host network) at:\thttp://localhost:8080${config.backendPath}`
  );
};

// Cache warming server bootstrap
export async function bootstrapCacheWarmingServer(config: Config) {
  const app = express();
  app.use(json());

  const { server, redis } = await loadCacheWarmingDependencies();
  cacheRoutes(app, server, redis);

  const httpServer = http.createServer(app);
  httpServer.listen(config.cacheWarmingPort);

  console.log(
    `Cache warming server ready at:\thttp://localhost:${config.cacheWarmingPort}/cache`
  );
}
