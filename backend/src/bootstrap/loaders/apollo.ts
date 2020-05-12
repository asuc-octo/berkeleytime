import Container from "typedi";
import { ApolloServer } from "apollo-server-express";

import { config } from "../../config";
import { buildSchema } from "../../utils";

export default async () => {
  const schema = await buildSchema();

  return new ApolloServer({
    schema,
    playground: config.isDev,
  });
};
