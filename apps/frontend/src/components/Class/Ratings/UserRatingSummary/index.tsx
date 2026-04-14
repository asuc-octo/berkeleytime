import { MetricName } from "@repo/shared";

import { IUserRatingClass } from "@/lib/api";

import { formatDate, isMetricRating } from "../metricsUtil";
import styles from "./UserRatingSummary.module.scss";

export default function UserRatingSummary({
  userRatings,
}: {
  userRatings: IUserRatingClass;
}) {
  const ratingMetrics = userRatings.metrics.filter((metric) =>
    isMetricRating(MetricName[metric.metricName])
  );
  const metricsAverage =
    ratingMetrics.length > 0
      ? ratingMetrics.reduce((sum, m) => sum + m.value, 0) /
        ratingMetrics.length
      : null;

  const rawGrade = (
    userRatings as IUserRatingClass & { reviewerGrade?: string | null }
  ).reviewerGrade;
  const displayGrade =
    rawGrade && rawGrade.toLowerCase() !== "n/a" ? rawGrade : "N/A";

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.titleDate}>
            <h3>{userRatings.reviewTitle}</h3>
            {userRatings.lastUpdated && (
              <h4>{formatDate(new Date(userRatings.lastUpdated))}</h4>
            )}
          </div>
          
          <h5>{userRatings.reviewContent || "No written review yet."}</h5>
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
