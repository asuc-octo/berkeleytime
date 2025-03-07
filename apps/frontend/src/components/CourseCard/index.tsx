import { useMemo } from "react";

import { ArrowRight } from "iconoir-react";

import { useReadCourse } from "@/hooks/api";

import AverageGrade from "../AverageGrade";
import CourseDrawer from "../CourseDrawer";
import styles from "./CourseCard.module.scss";

interface CourseProps {
  subject: string;
  number: string;
}

export default function CourseCard({ subject, number }: CourseProps) {
  const { data, loading } = useReadCourse(subject as string, number as string);

  const course = useMemo(() => data, [data]);

  return loading || !course ? (
    <></>
  ) : (
    <CourseDrawer subject={subject} number={number}>
      <div className={styles.root}>
        <div className={styles.text}>
          <p className={styles.heading}>
            {subject} {number}
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
    </CourseDrawer>
  );
}