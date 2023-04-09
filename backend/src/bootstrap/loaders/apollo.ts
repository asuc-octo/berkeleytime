import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../graphql/buildSchema";
import Keyv from "keyv";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { ErrorsAreMissesCache } from "@apollo/utils.keyvaluecache";

export default async () => {
  const schema = buildSchema();
  const redisCache = new KeyvAdapter(new Keyv("redis://localhost:6379"))
  const faultTolerantCache = new ErrorsAreMissesCache(redisCache)

  return new ApolloServer({
    schema,
    cache: faultTolerantCache,
    plugins: [responseCachePlugin()],
  });
};
