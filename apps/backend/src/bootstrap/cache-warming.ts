import express from "express";
import { json } from "express";
import http from "http";

import { Config } from "../config";
import cacheRoutes from "../modules/cache/routes";
import { loadCacheWarmingDependencies } from "./loaders";

/**
 * Cache warming server bootstrap
 *
 * Minimal HTTP server for internal cache warming operations.
 * Only loads essential dependencies (mongoose, redis, apollo) without
 * user-facing middleware (passport, CORS, sessions).
 *
 * Runs on a separate port from the main backend server.
 */
export default async (config: Config) => {
  const app = express();

  // Health check endpoint
  app.get("/healthz", (_, res) => {
    res.status(200).send("OK");
  });

  // Body parser for POST requests
  app.use(json());

  // Load minimal dependencies
  const { server, redis } = await loadCacheWarmingDependencies();

  // Mount cache routes (no path prefix - direct access)
  cacheRoutes(app, server, redis);

  const httpServer = http.createServer(app);

  httpServer.listen(config.cacheWarmingPort);

  console.log(
    `Cache warming server ready at:\thttp://localhost:${config.cacheWarmingPort}/cache`
  );
};
