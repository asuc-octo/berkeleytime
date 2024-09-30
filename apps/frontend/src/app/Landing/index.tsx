import Features from "./Features";
import Hero from "./Hero";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

const Home = () => {
  return (
    <div className={styles.root}>
      <Hero />
      <Features />
      <Organization />
    </div>
  );
};

export default Home;
