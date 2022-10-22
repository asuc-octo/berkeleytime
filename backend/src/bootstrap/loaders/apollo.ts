import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import { config } from "../../config";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { buildSchema } from "../../utils/buildSchema";

export default async () => {
  const schema = buildSchema();

  return new ApolloServer({
    schema,
    playground: config.isDev,
  });
};
