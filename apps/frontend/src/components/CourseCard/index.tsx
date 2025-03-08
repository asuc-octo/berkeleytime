import { ArrowRight } from "iconoir-react";

import { ICourse } from "@/lib/api";

import AverageGrade from "../AverageGrade";
import styles from "./CourseCard.module.scss";

interface CourseCardProps {
  course: ICourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className={styles.root}>
      <div className={styles.text}>
        <p className={styles.heading}>
          {course.subject} {course.number}
        </p>
        <p className={styles.description}>{course.title}</p>
        <div className={styles.row}>
          <AverageGrade gradeDistribution={course.gradeDistribution} />
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
