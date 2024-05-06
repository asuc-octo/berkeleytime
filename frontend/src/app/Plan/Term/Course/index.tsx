import classNames from "classnames";
import { Book } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Units from "@/components/Units";
import { ICourse } from "@/lib/api";

import styles from "./Course.module.scss";

export default function Course({
  subject,
  number,
  title,
  gradeAverage,
}: ICourse) {
  return (
    <div className={classNames(styles.root, "draggable")}>
      <div className={styles.body}>
        <div className={styles.text}>
          <p className={styles.title}>
            {subject} {number}
          </p>
          <p className={styles.description}>{title}</p>
          <div className={styles.row}>
            <AverageGrade gradeAverage={gradeAverage} />
            <div className={styles.badge}>
              <Book />
              Major
            </div>
            <Units unitsMin={4} unitsMax={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
