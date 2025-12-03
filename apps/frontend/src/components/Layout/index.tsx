import classNames from "classnames";
import { Outlet } from "react-router";

import { Flex } from "@repo/theme";

import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import Banner from "./Banner";
import styles from "./Layout.module.scss";

interface LayoutProps {
  header?: boolean;
  footer?: boolean;
}

export default function Layout({ header = true, footer = true }: LayoutProps) {
  return (
    <Flex direction="column">
      <Flex
        direction="column"
        className={classNames(styles.view, { [styles.locked]: !footer })}
      >
        <Banner />
        {header && <NavigationBar />}
        <Outlet />
      </Flex>
      {footer && <Footer />}
    </Flex>
  );
}
