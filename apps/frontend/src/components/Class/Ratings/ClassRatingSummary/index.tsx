import { useState } from "react";

import { METRIC_ORDER, MetricName } from "@repo/shared";

import { formatDate, getAverageRatingColor, isMetricRating } from "../metricsUtil";
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
      ? ratingMetrics.reduce((sum, m) => {
          const value =
            m.metricName === MetricName.Difficulty ||
            m.metricName === MetricName.Workload
              ? 5 - m.value
              : m.value;
          return sum + value;
        }, 0) / ratingMetrics.length
      : null;

  const rawGrade = classReview.reviewerGrade;
  const displayGrade =
    rawGrade && rawGrade.toLowerCase() !== "n/a" ? rawGrade : "N/A";

  const ratingColor = metricsAverage != null ? getAverageRatingColor(metricsAverage) : null;

  const [isExpanded, setIsExpanded] = useState(false);

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
          <div className={isExpanded ? styles.contentWrapper : `${styles.contentWrapper} ${styles.clamped}`}>
            {classReview.reviewContent || "No written review yet."}
            {!isExpanded && (
              <button
                className={styles.moreButton}
                onClick={() => setIsExpanded(true)}
              >
                More
              </button>
            )}
          </div>
          {isExpanded && (
            <div className={styles.metricsRow}>
              {METRIC_ORDER.map((metricName) => {
                const metric = (classReview.metrics ?? []).find(
                  (m) => m.metricName === metricName
                );
                if (!metric) return null;
                return (
                  <div key={metricName} className={styles.metricItem}>
                    <span className={styles.metricLabel}>{metricName}</span>
                    <span className={styles.metricValue}>
                      {metric.value.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className={styles.actions}>
            <button className={styles.helpfulButton}>Helpful</button>
            <button className={styles.reportButton}>Report</button>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyRight}>
          <h2 className={styles.ratingGrade}>Rating</h2>
          <div
            className={styles.rating}
            style={ratingColor ? {
              borderColor: ratingColor.badge,
              backgroundColor: ratingColor.bg,
              color: ratingColor.badge,
            } : undefined}
          >
            {metricsAverage != null ? (
              <span>{metricsAverage.toFixed(1)}</span>
            ) : (
              <span>N/A</span>
            )}
          </div>
          <h2 className={styles.ratingGrade}>Grade</h2>
          <div className={`${styles.grade}${displayGrade === "N/A" ? ` ${styles.naGrade}` : ""}`}>
            <span>{displayGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
