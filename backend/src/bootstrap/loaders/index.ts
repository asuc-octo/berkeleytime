import express from "express";
import { ApolloServer } from "apollo-server-express";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";

export default async (app: express.Application): Promise<ApolloServer> => {
  // Load everything related to express
  await expressLoader(app);

  // You can add here the connection to your database, redis and so on
  // load apollo server config
  return apolloLoader();
};
