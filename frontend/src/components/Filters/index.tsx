import { ArrowSeparateVertical } from "iconoir-react";

import styles from "./Filters.module.scss";

export default function Filters() {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.select}>
          <div className={styles.text}>
            <div className={styles.label}>Year</div>
            <div className={styles.value}>2024</div>
          </div>
          <div className={styles.icon}>
            <ArrowSeparateVertical />
          </div>
        </div>
        <div className={styles.select}>
          <div className={styles.text}>
            <div className={styles.label}>Semester</div>
            <div className={styles.value}>Spring</div>
          </div>
          <div className={styles.icon}>
            <ArrowSeparateVertical />
          </div>
        </div>
      </div>
    </div>
  );
}
