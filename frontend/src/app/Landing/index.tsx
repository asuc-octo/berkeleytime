import Features from "./Features";
import Hero from "./Hero";
import HomeFooter from "./Organization";
import styles from "./Landing.module.scss";

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
