import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";
import { ApolloArmor } from "@escape.tech/graphql-armor";
import { RedisClientType } from "redis";

import { buildSchema } from "../graphql/buildSchema";

class RedisCache implements KeyValueCache {
  client: RedisClientType;

  prefix = "apollo-cache:";

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async get(key: string) {
    return (await this.client.get(this.prefix + key)) ?? undefined;
  }

  async set(key: string, value: string) {
    // ttl options are intentionally ignored because we will invalidate cache in update script
    await this.client.set(this.prefix + key, value);
  }

  async delete(key: string) {
    return (await this.client.del(this.prefix + key)) === 1;
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
      ApolloServerPluginCacheControl({ calculateHttpHeaders: false }),
      responseCachePlugin(),
    ],
    // TODO(production): Disable introspection in production
    introspection: true,
    cache: new RedisCache(redis),
  });

  await server.start();

  return server;
};
