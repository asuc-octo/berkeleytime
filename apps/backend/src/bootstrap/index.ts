import express from "express";
import http from "http";

import { Config } from "../../../../packages/common/src/utils/config";
import log from "../lib/logger";
import loaders from "./loaders";

export default async (config: Config) => {
  const app = express();
  app.set("trust proxy", 1);

  // log http requests
  app.use((req, res, next) => {
    if (
      req.path === "/healthz" ||
      req.path === "/health" ||
      req.path === "/ready"
    ) {
      return next();
    }
    const start = performance.now(); //start time
    res.on("finish", () => {
      const duration = Math.round(performance.now() - start); //duration (end time - start time)
      log.info(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get("user-agent"),
        },
        "http request"
      );
    });
    next();
  });

  app.get("/healthz", (_, res) => {
    res.status(200).send("OK");
  });

  await loaders(app);

  const httpServer = http.createServer(app);

  httpServer.listen(config.port);

  log.info(
    { port: config.port, path: config.backendPath },
    "Server ready (Docker network)"
  );
  log.info(
    { port: 3000, path: config.backendPath },
    "Server ready (host network)"
  );
};

/** 
// Cache warming server bootstrap
export async function bootstrapCacheWarmingServer(config: Config) {
  const app = express();
  app.use(express.json());

  const { redis } = await loadCacheWarmingDependencies();
  cacheRoutes(app, redis);

  const httpServer = http.createServer(app);
  httpServer.listen(config.cacheWarmingPort);

  log.info(
    { port: config.cacheWarmingPort, path: "/cache" },
    "Cache warming server ready"
  );
}
**/
