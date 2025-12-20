import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@repo/theme";

import Layout from "@/components/Layout";

import Dashboard from "./app/Dashboard";
import Stats from "./app/Stats";
import { useReadUser } from "./hooks/api/users/useReadUser";

export const BASE = import.meta.env.DEV
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
      {
        path: "stats",
        element: <Stats />,
      },
    ],
  },
]);

export default function App() {
  const { data: user, loading: userLoading } = useReadUser();

  if (userLoading) {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "16px",
          }}
        >
          <h1>Staff Dashboard</h1>
          <button
            onClick={() => signIn()}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
            }}
          >
            Sign in with Google
          </button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
