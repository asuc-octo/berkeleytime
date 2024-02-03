import { Outlet } from "react-router";

import Header from "@/components/Header";

import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
}

export default function Layout({ header = true }: LayoutProps) {
  return (
    <div className={styles.root}>
      {header && <Header />}
      <Outlet />
      {/* footer && <Footer /> */}
    </div>
  );
}
