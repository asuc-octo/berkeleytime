import express from "express";

import loaders from "./loaders";
import { Config } from "../config";

export default async (config: Config) => {
  const app = express();

  const server = await loaders(app);

  server.applyMiddleware({ app, path: config.graphqlPath });

  app.listen({ port: config.port }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${config.port}${config.graphqlPath}`
    )
  );
};
