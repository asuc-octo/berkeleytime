import styles from "./Hero.module.scss";
import SatherTower from "./SatherTower";

const GRADIENT = "linear-gradient(180deg,#62A5F4 0%, #3B82F6 100%)";

export default function Hero() {
  return (
    <div className={styles.root}>
      <div className={styles.heroBox} style={{ background: GRADIENT }}>
        <div className={styles.text}>
          <h1 className={styles.heading}>
            Confidently plan and manage your schedule
          </h1>
          <p className={styles.description}>
            The largest course discovery platform at Berkeley. Built by
            students, for students.
          </p>
        </div>
        <div className={styles.towerWrapper}>
          <SatherTower className={styles.campanile} />
        </div>
      </div>
    </div>
  );
}
