import { ReactNode } from "react";

import { ColoredSquare } from "@repo/theme";

import styles from "./CourseSideMetrics.module.scss";

export type CourseMetric = {
  label: string;
  value: ReactNode;
};

interface CourseSideMetricsProps {
  color: string;
  courseTitle: string;
  classTitle?: string;
  metadata: string;
  metrics: CourseMetric[];
}

export function CourseSideMetrics({
  color,
  courseTitle,
  classTitle,
  metadata,
  metrics,
}: CourseSideMetricsProps) {
  return (
    <div className={styles.info}>
      <div className={styles.classInfo}>
        <div className={styles.heading}>
          <span className={styles.course}>
            <ColoredSquare color={color} size="md" />
            {courseTitle}
          </span>
        </div>
        <div className={styles.classTitle}>
          {classTitle ?? "No Class Title Data"}
        </div>
        <div className={styles.metadata}>{metadata}</div>
      </div>

      <div className={styles.compactTitle}>
        <div className={styles.compactTitleLeft}>
          <ColoredSquare color={color} size="md" />
          <span className={styles.compactCourseTitle}>{courseTitle}</span>
        </div>
        {metadata !== "No Semester or Instructor Data" &&
          metadata !== "No Class Selected" && (
            <span className={styles.compactMetadata}>{metadata}</span>
          )}
      </div>

      <div className={styles.metricGroup}>
        {metrics.map((metric, index) => (
          <div className={styles.metric} key={index}>
            <div className={styles.label}>{metric.label}</div>
            <div className={styles.value}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSideMetrics;
