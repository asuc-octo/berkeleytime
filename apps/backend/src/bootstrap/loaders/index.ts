import { type Application, Router } from "express";

import { config } from "../../../../../packages/common/src/utils/config";
import log from "../../lib/logger";
import { startBannerViewCountFlushJob } from "../../modules/banner/jobs/flush-view-counts";
import { startViewCountFlushJob } from "../../modules/class/jobs/flush-view-counts";
import { startClickEventsFlushJob } from "../../modules/click-tracking/jobs/flush-click-events";
// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import redisLoader from "./redis";

export default async (root: Application): Promise<void> => {
  const app = Router() as Application;

  log.info("Booting up mongo...");
  await mongooseLoader();

  log.info("Booting up redis...");
  const redis = await redisLoader();

  log.info("Loading apollo...");
  const { server, redis: apolloRedis } = await apolloLoader(redis);

  log.info("Loading express...");
  await expressLoader(app, server, apolloRedis, root);

  // start background jobs
  startViewCountFlushJob(apolloRedis);
  startBannerViewCountFlushJob(apolloRedis);
  startClickEventsFlushJob(apolloRedis);

  // append backend path to all routes
  root.use(config.backendPath, app);
};

// loader for cache warming server
export async function loadCacheWarmingDependencies() {
  log.info("[cache-warmer] Booting up mongo...");
  await mongooseLoader();

  log.info("[cache-warmer] Booting up redis...");
  const redis = await redisLoader();

  log.info("[cache-warmer] Loading apollo...");
  const { server, redis: apolloRedis } = await apolloLoader(redis);

  return { server, redis: apolloRedis };
}
