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

import AddPost from "@/app/AddPost";
import Layout from "@/app/Layout";
import Post from "@/app/Post";
import Posts from "@/app/Posts";

import "./reset.css";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        loader: () => redirect("/posts"),
      },
      {
        path: "/posts",
        element: <Posts />,
      },
      {
        path: "/posts/new",
        element: <AddPost />,
      },
      {
        path: "/posts/:postId",
        element: <Post />,
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
      ? "http://localhost:8080/api/graphql"
      : "https://berkeleytime.com/api/graphql",
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
