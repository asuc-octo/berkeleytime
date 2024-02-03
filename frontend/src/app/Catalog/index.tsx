import MenuItem from "@/components/MenuItem";

import styles from "./Catalog.module.scss";

export default function Catalog() {
  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.placeholder} />
      </div>
      <div className={styles.panel}>
        <div className={styles.placeholder} />
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <MenuItem active>Sections</MenuItem>
          <MenuItem>Grades</MenuItem>
          <MenuItem>Enrollment</MenuItem>
        </div>
        <div className={styles.placeholder} />
      </div>
    </div>
  );
}
