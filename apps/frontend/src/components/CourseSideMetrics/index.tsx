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
