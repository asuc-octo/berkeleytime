import styles from "./Hero.module.scss";
import SatherTower from "./SatherTower";

export default function Hero() {
  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>
        Berkeley's largest
        <br />
        course discovery
        <br className={styles.tabletBreak} /> platform
      </h1>
      <SatherTower className={styles.tower} />
    </div>
  );
}
