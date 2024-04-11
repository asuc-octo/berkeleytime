import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../graphql/buildSchema";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export default async () => {
  const schema = buildSchema();

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })],
    introspection: true, // TODO(production): disable introspection upon final deployment
  });
  await server.start();

  return server;
};
