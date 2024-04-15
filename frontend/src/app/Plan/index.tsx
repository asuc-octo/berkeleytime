import styles from "./Plan.module.scss";

export default function Plan() {
  return (
    <div className={styles.root}>
      <div className={styles.sideBar}></div>
      <div className={styles.view}>
        <div className={styles.body}>
          <div className={styles.semester}></div>
          <div className={styles.semester}></div>
          <div className={styles.semester}></div>
        </div>
      </div>
    </div>
  );
}
