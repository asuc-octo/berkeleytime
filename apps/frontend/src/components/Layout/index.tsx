import { Suspense } from "react";

import { MessageText } from "iconoir-react";
import { Outlet } from "react-router";

import { Boundary, Button, LoadingIndicator } from "@repo/theme";

import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
  feedback?: boolean;
}

export default function Layout({
  header = true,
  footer = true,
  feedback,
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
      {feedback && (
        <div className={styles.feedback}>
          <Button
            as="a"
            href="https://forms.gle/zeAUQAHrMcrRJyhK6"
            target="_blank"
            className={styles.button}
            variant="solid"
          >
            <MessageText />
            Provide feedback
          </Button>
        </div>
      )}
    </div>
  );
}
