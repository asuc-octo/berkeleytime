import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from "@apollo/utils.keyvaluecache";
import { ApolloArmor } from "@escape.tech/graphql-armor";
import { RedisClientType } from "redis";
import { gunzipSync, gzipSync } from "zlib";

import { timeToNextPull } from "../../utils/cache";
import { buildSchema } from "../graphql/buildSchema";

class RedisCache implements KeyValueCache {
  client: RedisClientType;

  prefix = "apollo-cache:";

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async get(key: string) {
    const value = await this.client.get(this.prefix + key);

    if (!value) return undefined;

    const buffer = Buffer.from(value, "base64");
    return gunzipSync(buffer).toString("utf-8");
  }

  /**
   * Sets the value in the cache. Accepts a TTL. If no TTL is provided, the ApolloServerPluginCacheControl
   * default maxAge is used, and we use the minimum of the default and the time
   * until the next datapuller run (determined by timeToNextPull).
   */
  async set(
    key: string,
    value: string | null,
    options?: KeyValueCacheSetOptions
  ) {
    if (!value) return;

    await this.client.set(
      this.prefix + key,
      gzipSync(value).toString("base64"),
      {
        EX: Math.min(options?.ttl ?? 24 * 60 * 60, timeToNextPull()),
      }
    );
  }

  async delete(key: string) {
    const success = await this.client.del(this.prefix + key);

    return success === 1;
  }
}

// Limit GraphQL query depth to 3
const armor = new ApolloArmor({
  maxDepth: {
    enabled: true,
    n: 10,
  },
});

const protection = armor.protect();

export default async (redis: RedisClientType) => {
  const schema = buildSchema();

  const server = new ApolloServer({
    schema,
    validationRules: [...protection.validationRules],
    plugins: [
      ...protection.plugins,
      ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }),
      ApolloServerPluginCacheControl({
        calculateHttpHeaders: false,
        defaultMaxAge: 24 * 60 * 60, // 24 hours
      }),
      responseCachePlugin({
        sessionId: async (req) =>
          req.request.http?.headers.get("sessionId") || null,
      }),
    ],
    // TODO(prod): introspection: config.isDev,
    introspection: true,
    cache: new RedisCache(redis),
    // Increase limits for large requests
    csrfPrevention: false, // Disable CSRF prevention to reduce header size
    formatError: (formattedError) => {
      // Return BAD_USER_INPUT errors as 400s
      if (formattedError.extensions?.code === "BAD_USER_INPUT") {
        return {
          ...formattedError,
          extensions: {
            ...formattedError.extensions,
            http: { status: 400 },
          },
        };
      }
      // Return other errors as internal server errors
      return {
        message: formattedError.message,
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: { status: 500 },
        },
      };
    },
  });

  await server.start();

  return server;
};
