import Hero from "./Hero";
import Catalog from "./HomeFeature/Catalog";
import Grades from "./HomeFeature/Grades";
import Scheduler from "./HomeFeature/Scheduler";
import HomeFooter from "./HomeFooter/HomeFooter";
import styles from "./Landing.module.scss";

const Home = () => {
  return (
    <div className={styles.root}>
      <Hero />
      <Scheduler />
      <Catalog />
      <Grades />
      <HomeFooter />
    </div>
  );
};

export default Home;
