import { MouseEventHandler, forwardRef } from "react";

import { ArrowRight } from "iconoir-react";

import AverageGrade from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import styles from "./Class.module.scss";

interface ClassProps {
  index: number;
  onClick: MouseEventHandler<HTMLDivElement>;
}

const Course = forwardRef<HTMLDivElement, ClassProps & IClass>(
  (
    {
      course: {
        title: courseTitle,
        subject,
        number: courseNumber,
        gradeDistribution,
      },
      title,
      number,
      primarySection: { enrollCount, enrollMax, waitlistCount, waitlistMax },
      unitsMax,
      unitsMin,
      index,
      onClick,
    },
    ref
  ) => {
    return (
      <div
        className={styles.root}
        ref={ref}
        data-index={index}
        onClick={onClick}
      >
        <div className={styles.text}>
          <p className={styles.heading}>
            {subject} {courseNumber} #{number}
          </p>
          <p className={styles.description}>{title ?? courseTitle}</p>
          <div className={styles.row}>
            <AverageGrade gradeDistribution={gradeDistribution} />
            <Capacity
              enrollCount={enrollCount}
              enrollMax={enrollMax}
              waitlistCount={waitlistCount}
              waitlistMax={waitlistMax}
            />
            <Units unitsMin={unitsMin} unitsMax={unitsMax} />
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.icon}>
            <ArrowRight />
          </div>
        </div>
      </div>
    );
  }
);

export default Course;
