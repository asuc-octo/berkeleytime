import { type Application, Router } from "express";

import { config } from "../../config";
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
  const server = await apolloLoader(redis);

  // load everything related to express. depends on apollo
  console.log("Loading express...");
  await expressLoader(app, server, redis);

  // append backend path to all routes
  root.use(config.backendPath, app);
};
