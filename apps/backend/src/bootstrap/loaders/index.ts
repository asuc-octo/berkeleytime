import { type Application, Router } from "express";

import { config } from "../../../../../packages/common/src/utils/config";
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

  // connect to mongoose
  console.log("Booting up mongo...");
  await mongooseLoader();

  // connect to redis
  console.log("Booting up redis...");
  const redis = await redisLoader();

  // load apollo server config. must be loaded before express
  console.log("Loading apollo...");
  const { server, redis: apolloRedis } = await apolloLoader(redis);

  // load everything related to express. depends on apollo
  console.log("Loading express...");
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
  console.log("[Cache Warmer] Booting up mongo...");
  await mongooseLoader();

  console.log("[Cache Warmer] Booting up redis...");
  const redis = await redisLoader();

  console.log("[Cache Warmer] Loading apollo...");
  const { server, redis: apolloRedis } = await apolloLoader(redis);

  return { server, redis: apolloRedis };
}
