import express, { json } from "express";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import loaders from "./loaders";
import { Config } from "../config";
import http from "http";

export default async (config: Config) => {
  const app = express();

  const server = await loaders(app);
  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );

  const httpServer = http.createServer(app);

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: config.port }, resolve)
  );
  console.log(
    `🚀 Server ready at http://localhost:${config.port}${config.graphqlPath}`
  );
};
