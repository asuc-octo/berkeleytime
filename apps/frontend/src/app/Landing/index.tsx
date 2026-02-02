import Banner from "@/components/Banner";
import NavigationBar from "@/components/NavigationBar";

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
      <Organization />
    </div>
  );
};

export default Home;
