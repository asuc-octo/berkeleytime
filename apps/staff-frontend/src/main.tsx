import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { createRoot } from "react-dom/client";

import { persistedOperationFetch } from "@repo/shared";

import App from "@/App";
import { BASE } from "@/helper";

import "./main.scss";

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.DEV
      ? `${window.location.origin}/api/graphql`
      : `${BASE}/api/graphql`,
    credentials: "include",
    fetch: persistedOperationFetch,
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
