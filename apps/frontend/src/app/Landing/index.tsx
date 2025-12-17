import Banner from "@/components/Layout/Banner";
import NavigationBar from "@/components/NavigationBar";

import Features from "./Features";
import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

const Home = () => {
  return (
    <div className={styles.root}>
      <div className={styles.stickyHeader}>
        <Banner />
        <NavigationBar />
      </div>
      <Hero />
      <div className={styles.features}>
        <Features />
      </div>
      <Organization />
    </div>
  );
};

export default Home;
