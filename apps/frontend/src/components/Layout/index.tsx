import { Outlet, useSearchParams } from "react-router";

import { Flex } from "@repo/theme";

import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";

import Banner from "./Banner";
import styles from "./Layout.module.scss";

interface LayoutProps {
  banner?: boolean;
  header?: boolean;
  footer?: boolean;
  scrollLock?: boolean;
  headerBorder?: boolean;
}

export default function Layout({
  banner = true,
  header = true,
  footer = true,
  scrollLock = false,
  headerBorder = true,
}: LayoutProps) {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

  return (
    <Flex direction="column">
      <Flex
        direction="column"
        className={scrollLock ? styles.viewLocked : styles.view}
      >
        {banner && !isEmbed && <Banner />}
        {header && !isEmbed && <NavigationBar noBorder={!headerBorder} />}
        <Outlet />
      </Flex>
      {footer && !isEmbed && <Footer />}
    </Flex>
  );
}
