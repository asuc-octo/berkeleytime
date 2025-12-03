import type { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import compression from "compression";
import cors from "cors";
import { type Application, json } from "express";
import helmet from "helmet";
import { RedisClientType } from "redis";

import { config } from "../../config";
import semanticSearchRoutes from "../../modules/semantic-search/routes";
import passportLoader from "./passport";

export default async (
  app: Application,
  server: ApolloServer,
  redis: RedisClientType
) => {
  app.use(compression());

  // Body parser only needed during POST on the graphQL path
  app.use(json());

  // Cors configuration
  app.use(
    cors({
      // Allow requests from the local frontend (should be the only requirement)
      origin: [
        config.url,
        "http://localhost:8080",
        "http://localhost:8081",
        "https://ag.berkeleytime.com",
      ],
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

  // load semantic search routes
  app.use("/api/semantic-search", semanticSearchRoutes);

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
