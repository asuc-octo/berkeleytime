import type { Application } from "express";
import { json } from "express";
import cors from "cors";
import helmet from "helmet";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import passportLoader from "./passport";
import { config } from "../../config";

export default async (app: Application, server: ApolloServer) => {
  // Body parser only needed during POST on the graphQL path
  app.use(json());

  // Cors configuration
  app.use(cors({
    origin: config.url,
    credentials: true,
  }));

  // Sets various HTTP headers to help protect our app
  app.use(helmet());

  passportLoader(app);

  // graphql endpoint
  app.use(
    config.graphqlPath,
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
};
