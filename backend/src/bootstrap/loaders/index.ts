import { type Application, Router } from "express";
import { config } from "../../config";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import redisLoader from './redis';

export default async (root: Application): Promise<void> => {
  const app = Router() as Application;

  // Connect to redis
  console.log("Booting up redis...");
  await redisLoader();
  
  // connect to mongoose
  console.log("Booting up mongo...");
  await mongooseLoader();

  // load apollo server config. must be loaded before express
  console.log("Loading apollo...");
  const server = await apolloLoader();

  // load everything related to express. depends on apollo
  console.log("Loading express...");
  await expressLoader(app, server);

  // append backend path to all routes
  root.use(config.backendPath, app);
};
