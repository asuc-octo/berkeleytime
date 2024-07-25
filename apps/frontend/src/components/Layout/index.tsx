import { Suspense } from "react";

import { MessageText } from "iconoir-react";
import { Outlet } from "react-router";

import Button from "@/components/Button";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import Boundary from "../Boundary";
import LoadingIndicator from "../LoadingIndicator";
import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
}

export default function Layout({ header = true, footer = true }: LayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.view}>
        {header && <NavigationBar />}
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
      {footer && <Footer />}
      <div className={styles.feedback}>
        <Button
          as="a"
          href="https://forms.gle/zeAUQAHrMcrRJyhK6"
          target="_blank"
          className={styles.button}
        >
          <MessageText />
          Provide feedback
        </Button>
      </div>
    </div>
  );
}
