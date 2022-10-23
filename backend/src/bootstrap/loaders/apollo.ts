import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../../utils/buildSchema";

export default async () => {
  const schema = buildSchema();

  return new ApolloServer({
    schema,
  });
};
