import { Outlet } from "react-router";

import { Flex } from "@repo/theme";

import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import useMinWidth from "@/hooks/useMinWidth";

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
  const isAbovePhone = useMinWidth(768);
  const showBanner = banner && isAbovePhone;

  return (
    <Flex direction="column">
      <Flex
        direction="column"
        className={scrollLock ? styles.viewLocked : styles.view}
      >
        {(showBanner || header) && (
          <div ref={headerRef} className={styles.stickyHeader}>
            {showBanner && <Banner />}
            {header && <NavigationBar noBorder={!headerBorder} />}
          </div>
        )}
        <Outlet />
      </Flex>
      {footer && <Footer />}
    </Flex>
  );
}
