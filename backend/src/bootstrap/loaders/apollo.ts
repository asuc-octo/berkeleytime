import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../graphql/buildSchema";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { KeyValueCache, KeyValueCacheSetOptions } from '@apollo/utils.keyvaluecache';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { RedisClientType } from 'redis';

class RedisCache implements KeyValueCache {
  client: RedisClientType;
  prefix: string = 'apollo-cache:';

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async get(key: string) {
    return await this.client.get(this.prefix + key) ?? undefined;
  }

  async set(key: string, value: string, _?: KeyValueCacheSetOptions | undefined) {
    // ttl options are intentionally ignored because we will invalidate cache in update script
    await this.client.set(this.prefix + key, value) 
  }

  async delete(key: string) {
    return await this.client.del(this.prefix + key) === 1;
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
