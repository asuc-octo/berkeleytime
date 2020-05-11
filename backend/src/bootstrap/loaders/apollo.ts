import Container from "typedi";

import { ApolloServer } from "apollo-server-express";
import TodoResolver from "../../modules/todo/resolver";
import { buildSchema } from "type-graphql";
import { config } from "../../config";

export default async () => {
  const schema = await buildSchema({
    resolvers: [TodoResolver],
    container: Container,
  });

  return new ApolloServer({ schema, playground: config.isDev });
};
