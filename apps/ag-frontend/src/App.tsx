import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { IconoirProvider } from "iconoir-react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import Landing from "@/app/Landing";

import "./reset.css";

const router = createBrowserRouter([
  {
    index: true,
    element: <Landing />,
  },
  {
    path: "*",
    loader: () => redirect("/"),
  },
]);

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <Theme>
      <IconoirProvider
        iconProps={{
          strokeWidth: 2,
          width: 16,
          height: 16,
        }}
      >
        <ApolloProvider client={client}>
          <RouterProvider router={router} />
        </ApolloProvider>
      </IconoirProvider>
    </Theme>
  );
}
