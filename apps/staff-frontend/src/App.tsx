import { ArrowRight } from "iconoir-react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Button, ThemeProvider } from "@repo/theme";

import Layout from "@/components/Layout";

import styles from "./App.module.scss";
import Analytics from "./app/Analytics";
import Dashboard from "./app/Dashboard";
import Outreach from "./app/Outreach";
import { BASE, signIn } from "./helper";
import { useStaffMemberByUserId } from "./hooks/api/staff";
import { useReadUser } from "./hooks/api/users/useReadUser";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Analytics />,
      },
      {
        path: "members",
        element: <Dashboard />,
      },
      {
        path: "outreach",
        element: <Outreach />,
      },
    ],
  },
]);

export default function App() {
  const { data: user, loading: userLoading } = useReadUser();
  const { data: staffMember, loading: staffLoading } = useStaffMemberByUserId({
    userId: user?._id ?? null,
  });

  const isLoading = userLoading || (user && staffLoading);
  const isNotStaff = user && !staffLoading && !staffMember;

  if (isLoading) {
    return (
      <ThemeProvider forcedTheme="dark">
        <div className={styles.signInContainer}>Loading...</div>
      </ThemeProvider>
    );
  }

  if (!user || isNotStaff) {
    return (
      <ThemeProvider forcedTheme="dark">
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
          <Button
            variant="tertiary"
            onClick={() => signIn()}
            style={{ color: "var(--heading-color)" }}
          >
            Sign in
            <ArrowRight />
          </Button>
          {isNotStaff && (
            <p className={styles.errorText}>
              This account is not registered as a staff member
            </p>
          )}
          <a href={BASE} className={styles.returnLink}>
            Return to Bt
          </a>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider forcedTheme="dark">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
