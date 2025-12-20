import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Layout from "@/components/Layout";

import Dashboard from "./app/Dashboard";
import { useReadUser } from "./hooks/api/users/useReadUser";

const BASE = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://beta.berkeleytime.com";

export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ??
    window.location.origin + window.location.pathname + window.location.search;

  window.location.href = `${BASE}/api/login?redirect_uri=${redirectURI}`;
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
]);

const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

export default function App() {
  const { data: user, loading: userLoading } = useReadUser();

  if (userLoading || !user) {
    signIn();
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <ApolloProvider client={client}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  );
}
