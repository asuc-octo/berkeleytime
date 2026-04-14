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
    rawGrade && rawGrade.toLowerCase() !== "n/a" ? rawGrade : null;

  return (
    <div className={styles.root}>
      <div className={styles.title}>
        <div>
          {displayGrade ? (
            <h3>
              <span className={styles.headingGrade}>{displayGrade}</span>
            </h3>
          ) : null}
          {userRatings.lastUpdated && (
            <h5>{formatDate(new Date(userRatings.lastUpdated))}</h5>
          )}
          {userRatings.reviewTitle && (
            <p className={styles.reviewTitle}>{userRatings.reviewTitle}</p>
          )}
          <p className={styles.reviewContent}>
            {userRatings.reviewContent || "No written review yet."}
          </p>
        </div>
      </div>
      <div className={styles.body}>
        <div>
          {metricsAverage != null ? (
            <span>{metricsAverage.toFixed(1)}</span>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </div>
  );
}
