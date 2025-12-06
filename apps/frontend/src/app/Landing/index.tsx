import { useEffect, useState } from "react";

import Banner from "@/components/Layout/Banner";
import NavigationBar from "@/components/NavigationBar";

import Features from "./Features";
import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";
import Wave from "./Wave";

const Home = () => {
  // Berkeley time for clock display
  const [milliseconds, setMilliseconds] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setMilliseconds((milliseconds) => milliseconds + 1000),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.stickyHeader}>
        <Banner />
        <NavigationBar />
      </div>
      <Hero milliseconds={milliseconds} />
      <div className={styles.features}>
        <Features />
      </div>
      <Wave className={styles.bottomWave} fill="var(--foreground-color)" />
      <Organization />
    </div>
  );
};

export default Home;
