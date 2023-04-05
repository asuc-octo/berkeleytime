import express from "express";
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
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: {
          ...req.user,
          isAuthenticated: req.isAuthenticated(),
          logout: (callback: (err: any) => void) => req.logout(callback),
        },
      }),
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
