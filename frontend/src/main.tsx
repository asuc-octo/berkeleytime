import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./main.scss";

const client = new ApolloClient({
  uri: import.meta.env.DEV
    ? "http://localhost:8080/api/graphql"
    : "https://stanfurdtime.com/api/graphql",
  cache: new InMemoryCache(),
});

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
