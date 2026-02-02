import { Outlet } from "react-router";

import { Flex } from "@repo/theme";

import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";

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
  const { headerRef } = useHeaderHeight();

  return (
    <Flex direction="column">
      <Flex
        direction="column"
        className={scrollLock ? styles.viewLocked : styles.view}
      >
        {(banner || header) && (
          <div ref={headerRef} className={styles.stickyHeader}>
            {banner && <Banner />}
            {header && <NavigationBar noBorder={!headerBorder} />}
          </div>
        )}
        <Outlet />
      </Flex>
      {footer && <Footer />}
    </Flex>
  );
}
