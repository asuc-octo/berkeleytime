import { useEffect, useState } from "react";

import Banner from "@/components/Banner";
import NavigationBar from "@/components/NavigationBar";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import useMinWidth from "@/hooks/useMinWidth";

import Features from "./Features";
import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

const Home = () => {
  const { headerRef } = useHeaderHeight();
  const isAbovePhone = useMinWidth(768);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.root}>
      <div
        ref={headerRef}
        className={styles.stickyHeader}
        data-scrolled={isScrolled || undefined}
      >
        {isAbovePhone && <Banner />}
        <NavigationBar invert accentColor="var(--blue-500)" />
      </div>
      <Hero />
      <Features />
      <Organization />
    </div>
  );
};

export default Home;
