import { type Application, json } from "express";
import cors from "cors";
import helmet from "helmet";
import type { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { RedisClientType } from "redis";

import passportLoader from "./passport";
import { config } from "../../config";

export default async (
  app: Application,
  server: ApolloServer,
  redis: RedisClientType
) => {
  // Body parser only needed during POST on the graphQL path
  app.use(json());

  // Cors configuration
  app.use(
    cors({
      // Allow requests from the local frontend (should be the only requirement)
      origin: [config.url, "http://localhost:3000"],
      credentials: true,
    })
  );

  // Sets various HTTP headers to help protect our app
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            "data:",
            "apollo-server-landing-page.cdn.apollographql.com",
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            "apollo-server-landing-page.cdn.apollographql.com",
          ],
          frameSrc: [`'self'`, "sandbox.embed.apollographql.com"],
        },
      },
    })
  );

  // load authentication
  passportLoader(app, redis);

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
