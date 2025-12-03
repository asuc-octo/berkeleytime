import { Outlet } from "react-router";

import { Flex } from "@repo/theme";

import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import Banner from "./Banner";
import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
  scrollLock?: boolean;
}

export default function Layout({
  header = true,
  footer = true,
  scrollLock = false,
}: LayoutProps) {
  return (
    <Flex direction="column">
      <Flex
        direction="column"
        className={scrollLock ? styles.viewLocked : styles.view}
      >
        <Banner />
        {header && <NavigationBar />}
        <Outlet />
      </Flex>
      {footer && <Footer />}
    </Flex>
  );
}
