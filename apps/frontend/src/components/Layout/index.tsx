import { Suspense } from "react";

import { Outlet } from "react-router";

import { Boundary, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import Feedback from "./Feedback";
import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
  feedback?: boolean;
}

export default function Layout({
  header = true,
  footer = true,
  feedback = true,
}: LayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.view}>
        {header && <NavigationBar />}
        <Suspense
          fallback={
            <Boundary>
              <LoadingIndicator size="lg" />
            </Boundary>
          }
        >
          <Outlet />
        </Suspense>
      </div>
      {footer && <Footer />}
      {feedback && <Feedback />}
    </div>
  );
}
