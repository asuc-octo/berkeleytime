import Features from "./Features";
import Hero from "./Hero";
import styles from "./Landing.module.scss";
import HomeFooter from "./Organization";

const Home = () => {
  return (
    <div className={styles.root}>
      <Hero />
      <Features />
      <HomeFooter />
    </div>
  );
};

export default Home;
