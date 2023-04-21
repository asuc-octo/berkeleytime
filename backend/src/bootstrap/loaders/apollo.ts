import { ApolloServer } from "@apollo/server";
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { buildSchema } from "../graphql/buildSchema";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { getKeyvCache } from "./redis";

const CACHE_NAMESPACE = "gql-queries"

export default async () => {
  const schema = buildSchema();
  const cache = await getKeyvCache(CACHE_NAMESPACE);

  const server = new ApolloServer({
    schema,
    cache,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }),
      responseCachePlugin(),
      ApolloServerPluginCacheControl({ calculateHttpHeaders: false }), {
        async requestDidStart() {
          return {
            async willSendResponse(requestContext) {
              requestContext.response.http.headers.set('Cache-Control', 'no-cache');
            }
          };
        }
      }
    ],
  });
  await server.start();

  return server;
};
