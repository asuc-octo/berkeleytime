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

import AddPost from "./app/AddPost";
import "./reset.css";

const router = createBrowserRouter([
  {
    index: true,
    element: <Landing />,
  },
  {
    path: "/add-post",
    element: <AddPost />,
  },
  {
    path: "/posts/:postId", //be able to query with postid
    element: <AddPost />, // will need to fill out form with existing data for postId
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
