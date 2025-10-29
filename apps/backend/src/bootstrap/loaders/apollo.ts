import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from "@apollo/utils.keyvaluecache";
import { ApolloArmor } from "@escape.tech/graphql-armor";
import { createHash } from "crypto";
import { RedisClientType } from "redis";
import { gunzipSync, gzipSync } from "zlib";

import { timeToNextPull } from "../../utils/cache";
import { buildSchema } from "../graphql/buildSchema";

/**
 * Extracts the first query name from a GraphQL operation.
 * For example, if the query is "query { catalog(...) { ... } }", this returns "catalog".
 *
 * @param operation - The parsed GraphQL operation from the request context
 * @returns The name of the first query field, or null if not found
 */
function getOperationName(operation: any): string | null {
  const firstSelection = operation?.selectionSet?.selections?.[0];
  return firstSelection?.name?.value || null;
}

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

        /**
         * Custom cache key generator for the canonical catalog query only.
         *
         * GetCanonicalCatalog query gets a deterministic key for instant O(1) invalidation:
         *   Format: catalog:{year}-{semester}
         *   Example: "catalog:2024-fall"
         *
         * When enrollment updates for Fall 2024, invalidate directly:
         *   DEL apollo-cache:fqc:catalog:2024-fall
         *
         * All other queries use Apollo's default cache key.
         */
        generateCacheKey: (requestContext, keyData) => {
          const variables = requestContext.request.variables;
          const operation = requestContext.operation;
          const operationName = getOperationName(operation);

          // Only cache the GetCanonicalCatalog query (no search term)
          if (
            requestContext.operationName === "GetCanonicalCatalog" &&
            operationName === "catalog" &&
            variables?.year &&
            variables?.semester &&
            !variables?.query  // No search parameter
          ) {
            // Deterministic key - one per semester
            const semester = String(variables.semester).toLowerCase();
            return `catalog:${variables.year}-${semester}`;
          }

          // For all other queries, use default Apollo cache key
          return createHash("sha256")
            .update(JSON.stringify(keyData))
            .digest("hex");
        },
      }),
    ],
    // TODO(prod): introspection: config.isDev,
    introspection: true,
    cache: new RedisCache(redis),
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
