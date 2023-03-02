import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../../utils/buildSchema";
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export default async () => {
  const schema = buildSchema();

  return new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ includeCookies: true })]
  });
};
