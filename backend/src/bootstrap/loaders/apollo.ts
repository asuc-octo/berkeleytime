import { ApolloServer } from "apollo-server-express";

import { config } from "../../config";
import { buildSchema } from "../../utils";

export default async () => {
  const { resolvers, typeDefs } = buildSchema();

  return new ApolloServer({
    resolvers,
    typeDefs,
    playground: config.isDev,
  });
};
