import express from "express";
import { ApolloServer } from "@apollo/server";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";

export default async (app: express.Application): Promise<ApolloServer> => {
  // Load everything related to express
  console.log("Booting up express...");
  await expressLoader(app);

  // Connect to mongoose
  console.log("Booting up mongo...");
  await mongooseLoader();

  // load apollo server config
  console.log("Booting up apollo...");
  return apolloLoader();
};
