import { MouseEventHandler, forwardRef } from "react";

import { ArrowRight } from "iconoir-react";

import { AverageGrade } from "@/components/AverageGrade";
import { ICourse } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  index: number;
  onClick: MouseEventHandler<HTMLDivElement>;
  showGrades: boolean;
}

const Course = forwardRef<HTMLDivElement, CourseProps & ICourse>(
  (
    { title, subject, number, gradeDistribution, index, onClick, showGrades },
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
            {subject} {number}
          </p>
          <p className={styles.description}>{title}</p>
          {showGrades && (
            <div className={styles.row}>
              <AverageGrade gradeDistribution={gradeDistribution} />
            </div>
          )}
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
