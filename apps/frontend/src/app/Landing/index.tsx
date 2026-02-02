import Banner from "@/components/Banner";
import NavigationBar from "@/components/NavigationBar";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";

import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

const Home = () => {
  const { headerRef } = useHeaderHeight();

  return (
    <div className={styles.root}>
      <div ref={headerRef} className={styles.stickyHeader}>
        <Banner />
        <NavigationBar />
      </div>
      <Hero />
      <Organization />
    </div>
  );
};

export default Home;
