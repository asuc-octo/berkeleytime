import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import { BASE } from "@/helper";

import "./main.scss";

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${BASE}/api/graphql`,
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
