import { Suspense } from "react";

import { Outlet } from "react-router";

import Boundary from "../Boundary";
import LoadingIndicator from "../LoadingIndicator";
import styles from "./Layout.module.scss";

export default function Layout() {
  return (
    <div className={styles.root}>
      <Suspense
        fallback={
          <Boundary>
            <LoadingIndicator />
          </Boundary>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}
