import { Outlet, useNavigation } from "react-router";

import Boundary from "@/components/Boundary";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LoadingIndicator from "@/components/LoadingIndicator";

import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
}

export default function Layout({ header = true, footer = true }: LayoutProps) {
  const { state } = useNavigation();

  return (
    <div className={styles.root}>
      {header && <Header />}
      {state === "loading" ? (
        <Boundary>
          <LoadingIndicator />
        </Boundary>
      ) : (
        <Outlet />
      )}
      {footer && <Footer />}
    </div>
  );
}
