import type { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import compression from "compression";
import cors from "cors";
import { type Application, json } from "express";
import helmet from "helmet";
import { RedisClientType } from "redis";

import semanticSearchRoutes from "../../modules/semantic-search/routes";
import { config } from "../../../../../packages/common/src/utils/config";
import staffRoutes from "../../modules/staff/routes";
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
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://ag.berkeleytime.com",
        "https://staff.berkeleytime.com",
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
  app.use("/semantic-search", semanticSearchRoutes);
  // load staff routes
  staffRoutes(app);

  app.use(
    config.graphqlPath,
    expressMiddleware(server, {
      context: async ({ req }) => ({
        req,
        redis,
        user: {
          ...req.user,
          isAuthenticated: req.isAuthenticated(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logout: (callback: (err: any) => void) => req.logout(callback),
        },
      }),
    })
  );
};
