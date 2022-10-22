import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import { config } from "../../config";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { buildSchema } from "../../utils/buildSchema";

export default async () => {
  const schema = buildSchema();
  // console.log(typeDefs);

  // const mergedTypeDefs = mergeTypeDefs(typeDefs);
  // console.log(mergedTypeDefs);
  return new ApolloServer({
    schema,
    playground: config.isDev,
  });
};
