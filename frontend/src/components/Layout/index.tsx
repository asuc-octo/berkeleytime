import { MessageText } from "iconoir-react";
import { Outlet, useNavigation } from "react-router";

import Boundary from "@/components/Boundary";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import LoadingIndicator from "@/components/LoadingIndicator";
import NavigationBar from "@/components/NavigationBar";

import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
}

export default function Layout({ header = true, footer = true }: LayoutProps) {
  const { state } = useNavigation();

  return (
    <div className={styles.root}>
      {header && <NavigationBar />}
      {state === "loading" ? (
        <Boundary>
          <LoadingIndicator />
        </Boundary>
      ) : (
        <Outlet />
      )}
      {footer && <Footer />}
      <div className={styles.trigger}>
        <a href="https://forms.gle/zeAUQAHrMcrRJyhK6" target="_blank">
          <Button className={styles.button}>
            <MessageText />
            Provide feedback
          </Button>
        </a>
      </div>
    </div>
  );
}
