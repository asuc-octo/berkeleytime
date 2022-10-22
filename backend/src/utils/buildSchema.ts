import { makeExecutableSchema } from "apollo-server-express";
import { resolvers, typeDefs } from "../modules";
import { mergeSchemas } from "@graphql-tools/schema";

// Here goes your schema building bit, doing it this way allows us to use it in the tests as well!
export const buildSchema = () => {
  const schema = mergeSchemas({
    typeDefs,
    resolvers,
  });

  return schema;
};
