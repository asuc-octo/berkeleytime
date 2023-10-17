import type { Application } from "express";
import type { ApolloServer } from "@apollo/server";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import redisLoader from "./redis";
import passportLoader from './passport';
import { RedisClientType } from "redis";

export default async (app: Application): Promise<ApolloServer> => {
  // Load everything related to express
  console.log("Booting up express...");
  await expressLoader(app);

  console.log("Booting up passport...");
  await passportLoader(app);

  // Connect to mongoose
  console.log("Booting up mongo...");
  await mongooseLoader();

  // Connect to redis
  console.log("Booting up redis...");
  await redisLoader();

  // load apollo server config
  console.log("Booting up apollo...");
  return apolloLoader();
};
