import Container from "typedi";
import { ApolloServer } from "apollo-server-express";

import { resolvers } from "../../modules";

import { buildSchema } from "type-graphql";
import { config } from "../../config";

export default async () => {
  const schema = await buildSchema({
    resolvers,
    container: Container,
  });

  return new ApolloServer({
    schema,
    playground: config.isDev,
  });
};
