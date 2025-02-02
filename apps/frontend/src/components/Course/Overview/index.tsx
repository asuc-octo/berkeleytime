import useCourse from "@/hooks/useCourse";

import styles from "./Overview.module.scss";


export default function Overview() {
  const { course } = useCourse();

  return (
    <div className={styles.root}>
      <p className={styles.label}>Description</p>
      <p className={styles.description}>
        { course.description }
      </p>
    </div>
  );
}
