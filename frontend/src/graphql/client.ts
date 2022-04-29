import { ApolloClient, HttpLink } from "@apollo/client";

import { cache } from "./cache";

const link = new HttpLink({
  uri: "http://localhost:8080/api/graphql",
});

const client = new ApolloClient({
  link: link,
  cache: cache,
});

export default client;
