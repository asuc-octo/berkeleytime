import { ApolloClient, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { IconoirProvider } from "iconoir-react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";

import CuratedClass from "@/app/CuratedClass";
import CuratedClasses from "@/app/CuratedClasses";
import Layout from "@/app/Layout";
import New from "@/app/New";

import "./reset.css";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect("/curated-classes"),
      },
      {
        path: "/curated-classes",
        element: <CuratedClasses />,
      },
      {
        path: "/curated-classes/new",
        element: <New />,
      },
      {
        path: "/curated-classes/:curatedClassId",
        element: <CuratedClass />,
      },
      {
        path: "*",
        loader: () => redirect("/"),
      },
    ],
  },
]);

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.DEV
      ? "http://localhost:3000/api/graphql"
      : "https://berkeleytime.com/api/graphql",
    credentials: "include",
  }),
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
