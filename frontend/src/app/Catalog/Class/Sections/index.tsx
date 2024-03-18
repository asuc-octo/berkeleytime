import Capacity from "../../../../components/Capacity";
import styles from "./Sections.module.scss";

export default function Sections() {
  return (
    <div className={styles.root}>
      <div className={styles.section}>
        <div className={styles.header}>
          <div className={styles.text}>
            <div className={styles.title}>Section 1</div>
            <div className={styles.description}>Instructor: John Doe</div>
          </div>
          <Capacity
            count={10}
            capacity={20}
            waitlistCount={5}
            waitlistCapacity={10}
          />
        </div>
      </div>
      <div className={styles.section}></div>
      <div className={styles.section}></div>
    </div>
  );
}
