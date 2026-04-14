import { MetricName } from "@repo/shared";

import { formatDate, isMetricRating } from "../metricsUtil";
import styles from "./ClassRatingSummary.module.scss";

export interface ClassUserReview {
  professorName?: string | null;
  metrics?: Array<{ metricName: MetricName; value: number }>;
  reviewTitle?: string | null;
  reviewContent?: string | null;
  reviewerGrade?: string | null;
  lastUpdated?: string | null;
}

export default function ClassRatingSummary({
  classReview,
}: {
  classReview: ClassUserReview;
}) {
  const ratingMetrics = (classReview.metrics ?? []).filter((metric) =>
    isMetricRating(MetricName[metric.metricName])
  );
  const metricsAverage =
    ratingMetrics.length > 0
      ? ratingMetrics.reduce((sum, m) => sum + m.value, 0) /
        ratingMetrics.length
      : null;

  const rawGrade = classReview.reviewerGrade;
  const displayGrade =
    rawGrade && rawGrade.toLowerCase() !== "n/a" ? rawGrade : "N/A";

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.titleDate}>
            <h3>{classReview.reviewTitle || "No title"}</h3>
            {classReview.lastUpdated && (
              <h4>{formatDate(new Date(classReview.lastUpdated))}</h4>
            )}
          </div>

          <h5>{classReview.reviewContent || "No written review yet."}</h5>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyRight}>
          <h2 className={styles.ratingGrade}>Rating</h2>
          <div className={styles.rating}>
            {metricsAverage != null ? (
              <span>{metricsAverage.toFixed(1)}</span>
            ) : (
              <span>N/A</span>
            )}
          </div>
          <h2 className={styles.ratingGrade}>Grade</h2>
          <div className={styles.grade}>
            <span>{displayGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
