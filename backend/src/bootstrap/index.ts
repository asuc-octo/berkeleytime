import express from "express";
import loaders from "./loaders";
import { Config } from "../config";
import http from "http";

export default async (config: Config) => {
  const app = express();

  await loaders(app);

  const httpServer = http.createServer(app);

  await httpServer.listen(config.port);

  console.log(`🚀 Server ready at http://localhost:${config.port}${config.backendPath}${config.graphqlPath}`);
};
