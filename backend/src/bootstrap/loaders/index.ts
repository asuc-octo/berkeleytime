import express from "express";
import { ApolloServer } from "apollo-server-express";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";

export default async (app: express.Application): Promise<ApolloServer> => {
  // Load everything related to express
  await expressLoader(app);

  // Connect to mongoose
  await mongooseLoader();

  // load apollo server config
  return apolloLoader();
};
