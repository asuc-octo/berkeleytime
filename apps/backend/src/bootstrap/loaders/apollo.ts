import { ApolloServer } from "@apollo/server";
import responseCachePlugin from "@apollo/server-plugin-response-cache";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { KeyValueCache } from "@apollo/utils.keyvaluecache";
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

export default async (redis: RedisClientType) => {
  const schema = buildSchema();

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }),
      ApolloServerPluginCacheControl({ calculateHttpHeaders: false }),
      responseCachePlugin(),
    ],
    introspection: true, // TODO(production): disable introspection upon final deployment
    cache: new RedisCache(redis),
  });
  await server.start();

  return server;
};
