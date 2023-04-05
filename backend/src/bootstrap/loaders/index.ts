import type { Application } from "express";
import type { ApolloServer } from "@apollo/server";

// loaders
import apolloLoader from "./apollo";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import passportLoader from './passport';

export default async (app: Application): Promise<ApolloServer> => {
  // Load everything related to express
  console.log("Booting up express...");
  await expressLoader(app);

  console.log("Booting up passport...");
  await passportLoader(app);

  // Connect to mongoose
  console.log("Booting up mongo...");
  await mongooseLoader();

  // load apollo server config
  console.log("Booting up apollo...");
  return apolloLoader();
};
