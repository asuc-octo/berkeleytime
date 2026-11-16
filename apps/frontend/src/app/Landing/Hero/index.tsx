import { Link } from "react-router-dom";

import { Button } from "@repo/theme";

import towerLightTop from "../assets/tower-light-top.svg";
import towerLight from "../assets/tower-light.svg";
import towerSpire from "../assets/tower-spire.svg";
import tower from "../assets/tower.svg";
import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <div className={styles.root}>
      <div className={styles.tower} aria-hidden>
        <img src={tower} alt="" className={styles.towerBody} />
        <img src={towerSpire} alt="" className={styles.towerSpire} />
        <img src={towerLight} alt="" className={styles.towerLight} />
        <img src={towerLightTop} alt="" className={styles.towerLightTop} />
      </div>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          Welcome to
          <br />
          Berkeleytime!
        </h1>
        <p className={styles.description}>
          Berkeleytime is a platform built, maintained, and run by students,
          just like you!
        </p>
        <Button as={Link} to="/catalog" className={styles.button}>
          Explore Courses
        </Button>
      </div>
    </div>
  );
}
