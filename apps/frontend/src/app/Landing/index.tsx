import Banner from "@/components/Layout/Banner";
import NavigationBar from "@/components/NavigationBar";

import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";
import ScrollFeatures from "./ScrollFeatures";

const Home = () => {
  return (
    <div className={styles.root}>
      <div className={styles.stickyHeader}>
        <Banner />
        <NavigationBar />
      </div>
      <Hero />
      <ScrollFeatures />
      <Organization />
    </div>
  );
};

export default Home;
