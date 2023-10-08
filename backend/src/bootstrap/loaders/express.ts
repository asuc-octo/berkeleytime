import { type Application, json } from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import helmet from "helmet";
import type { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import passportLoader from "./passport";
import { config } from "../../config";

export default async (app: Application, server: ApolloServer) => {
  // Body parser only needed during POST on the graphQL path
  app.use(json());
  app.use(cookieParser());

  // Cors configuration
  app.use(cors({
    origin: config.url,
    credentials: true,
  }));

  // Sets various HTTP headers to help protect our app
  app.use(helmet());

  // load authentication
  passportLoader(app);

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
