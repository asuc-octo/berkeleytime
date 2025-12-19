import { Outlet } from "react-router-dom";

import NavigationBar from "@/components/NavigationBar";

import styles from "./Layout.module.scss";

export default function Layout() {
  return (
    <div className={styles.root}>
      <NavigationBar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

