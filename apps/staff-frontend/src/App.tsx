import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ArrowRight } from "iconoir-react";

import { Button, ThemeProvider } from "@repo/theme";

import Layout from "@/components/Layout";

import Dashboard from "./app/Dashboard";
import Stats from "./app/Stats";
import { useReadUser } from "./hooks/api/users/useReadUser";
import styles from "./App.module.scss";

export const BASE = import.meta.env.DEV
  ? "http://localhost:8080"
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
        <div className={styles.signInContainer}>Loading...</div>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <div className={styles.signInContainer}>
          <pre className={styles.asciiArt}>{`                .,,uod8B8bou,,.
           ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
      ,=m8BBBBBBBBBBBBBBBRPFT?!||||||||||||||
      !...:!TVBBBRPFT||||||||||!!^^""'   ||||
      !.......:!?|||||!!^^""'            ||||
      !.........||||                     ||||
      !.........||||  $                  ||||
      !.........||||                     ||||
      !.........||||                     ||||
      !.........||||                     ||||
      !.........||||                     ||||
       \`........||||                    ,||||
        .;.......||||               _.-!!|||||
 .,uodWBBBBb.....||||       _.-!!|||||||||!:'
!YBBBBBBBBBBBBBBb..!|||:..-!!|||||||!iof68BBBBBb....
!..YBBBBBBBBBBBBBBb!!||||||||!iof68BBBBBBRPFT?!::   \`.
!....YBBBBBBBBBBBBBBbaaitf68BBBBBBRPFT?!:::::::::     \`.
!......YBBBBBBBBBBBBBBBBBBBRPFT?!::::::;:!^"\`;:::       \`.
!........YBBBBBBBBBBRPFT?!::::::::::^''...::::::;         iBBbo.
\`..........YBRPFT?!::::::::::::::::::::::::;iof68bo.      WBBBBbo.
  \`..........:::::::::::::::::::::::;iof688888888888b.     \`YBBBP^'
    \`........::::::::::::::::;iof688888888888888888888b.     \`
      \`......:::::::::;iof688888888888888888888888888888b.
        \`....:::;iof688888888888888888888888888888888899fT!
          \`..::!8888888888888888888888888888888899fT|!^"'
            \`' !!988888888888888888888888899fT|!^"'
                \`!!8888888888888888899fT|!^"'
                  \`!988888888899fT|!^"'
                    \`!9899fT|!^"'
                      \`!^"'`}</pre>
          <h1 className={styles.heading}>Staff Dashboard</h1>
          <Button onClick={() => signIn()}>
            Sign in
            <ArrowRight />
          </Button>
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
