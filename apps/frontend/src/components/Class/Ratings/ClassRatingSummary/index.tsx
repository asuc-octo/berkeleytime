import { useLayoutEffect, useRef, useState } from "react";

import { useMutation } from "@apollo/client/react";

import { METRIC_ORDER, MetricName } from "@repo/shared";

import { VOTE_REVIEW_HELPFUL } from "@/lib/api/ratings";
import {
  VoteReviewHelpfulMutation,
  VoteReviewHelpfulMutationVariables,
} from "@/lib/generated/graphql";

import {
  formatDate,
  getAverageRatingColor,
  isMetricRating,
} from "../metricsUtil";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./ClassRatingSummary.module.scss";

export interface ClassUserReview {
  professorName?: string | null;
  metrics?: Array<{ metricName: MetricName; value: number }>;
  reviewTitle?: string | null;
  reviewContent?: string | null;
  reviewerGrade?: string | null;
  lastUpdated?: string | null;
  reviewId?: string | null;
  helpfulCount?: number | null;
}

export default function ClassRatingSummary({
  classReview,
}: {
  classReview: ClassUserReview;
}) {
  const [voteHelpful] = useMutation<
    VoteReviewHelpfulMutation,
    VoteReviewHelpfulMutationVariables
  >(VOTE_REVIEW_HELPFUL);

  const storageKey = classReview.reviewId
    ? `bt_helpful_${classReview.reviewId}`
    : null;

  const [hasVoted, setHasVoted] = useState(() =>
    storageKey ? localStorage.getItem(storageKey) === "true" : false
  );

  const handleHelpful = async () => {
    if (!classReview.reviewId || !storageKey) return;
    const next = !hasVoted;
    setHasVoted(next);
    localStorage.setItem(storageKey, String(next));
    await voteHelpful({ variables: { reviewId: classReview.reviewId } });
  };

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

  const ratingColor =
    metricsAverage != null ? getAverageRatingColor(metricsAverage) : null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [classReview.reviewContent]);

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
          <div
            ref={contentRef}
            className={
              isExpanded
                ? styles.contentWrapper
                : `${styles.contentWrapper} ${styles.clamped}`
            }
          >
            {classReview.reviewContent || "No written review yet."}
            {!isExpanded && isOverflowing && (
              <button
                className={styles.moreButton}
                onClick={() => setIsExpanded(true)}
              >
                More
              </button>
            )}
            {!isExpanded && !isOverflowing && (
              <button
                className={styles.moreButtonInline}
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
                    <span className={styles.metricValue}>{metric.value}</span>
                  </div>
                );
              })}
            </div>
          )}
          <div className={styles.actions}>
            <button
              className={`${styles.helpfulButton}${hasVoted ? ` ${styles.helpfulButtonActive}` : ""}`}
              onClick={handleHelpful}
            >
              Helpful
            </button>
            {/* <button className={styles.reportButton}>Report</button> */}
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyRight}>
          <h2 className={styles.ratingGrade}>Rating</h2>
          <div
            className={styles.rating}
            style={
              ratingColor
                ? {
                    borderColor: ratingColor.badge,
                    backgroundColor: ratingColor.bg,
                    color: ratingColor.badge,
                  }
                : undefined
            }
          >
            {metricsAverage != null ? (
              <span>{metricsAverage.toFixed(1)}</span>
            ) : (
              <span>N/A</span>
            )}
          </div>
          <h2 className={styles.ratingGrade}>Grade</h2>
          <div
            className={`${styles.grade}${displayGrade === "N/A" ? ` ${styles.naGrade}` : ""}`}
          >
            <span>{displayGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
