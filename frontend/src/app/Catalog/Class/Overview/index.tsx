import Details from "@/components/Details";
import { IClass } from "@/lib/api";

import styles from "./Overview.module.scss";

interface OverviewProps {
  currentClass?: IClass;
}

export default function Overview({ currentClass }: OverviewProps) {
  if (!currentClass) return null;

  return (
    <div className={styles.root}>
      <Details {...currentClass.primarySection.meetings[0]} />
      <p className={styles.label}>Description</p>
      <p className={styles.description}>
        {currentClass.description ?? currentClass.course.description}
      </p>
      {currentClass.course.requirements && (
        <>
          <p className={styles.label}>Prerequisites</p>
          <p className={styles.description}>
            {currentClass.course.requirements}
          </p>
        </>
      )}
    </div>
  );
}