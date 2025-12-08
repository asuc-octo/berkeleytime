import { useEffect, useState } from "react";

import Banner from "@/components/Layout/Banner";
import NavigationBar from "@/components/NavigationBar";

import Features from "./Features";
import Hero from "./Hero";
import { useSkyGradient } from "./Hero/useSkyGradient";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

const Home = () => {
  // Berkeley time for clock display
  const [milliseconds, setMilliseconds] = useState(() => Date.now());
  const [scrolled, setScrolled] = useState(false);
  const { gradient } = useSkyGradient(milliseconds);

  useEffect(() => {
    const interval = setInterval(
      () => setMilliseconds((milliseconds) => milliseconds + 1000),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Start fading in after scrolling 50px
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.heroBackground} style={{ background: gradient }} />
      <div className={styles.stickyHeader}>
        <Banner transparent={!scrolled} />
        <NavigationBar invert={!scrolled} noBorder />
      </div>
      <Hero milliseconds={milliseconds} />
      <div className={styles.features}>
        <Features />
      </div>
      <Organization />
    </div>
  );
};

export default Home;
