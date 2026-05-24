import { useLayoutEffect, useRef, useState } from "react";

import { METRIC_ORDER } from "@repo/shared";

import { IUserRatingClass } from "@/lib/api";

import { formatDate } from "../metricsUtil";
import styles from "./UserRatingSummary.module.scss";

export default function UserRatingSummary({
  userRatings,
}: {
  userRatings: IUserRatingClass;
}) {
  const rawGrade = (
    userRatings as IUserRatingClass & { reviewerGrade?: string | null }
  ).reviewerGrade;
  const displayGrade =
    rawGrade && rawGrade.toLowerCase() !== "n/a" ? rawGrade : "N/A";

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, [userRatings.reviewContent]);

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.bodyLeft}>
          <div className={styles.titleDate}>
            <h3>{userRatings.reviewTitle}</h3>
            <h4>
              {userRatings.lastUpdated &&
                `${formatDate(new Date(userRatings.lastUpdated))} | `}
              {userRatings.semester} {userRatings.year}
              {userRatings.professorName && `, ${userRatings.professorName}`}
            </h4>
          </div>
          <div
            ref={contentRef}
            className={
              isExpanded
                ? styles.contentWrapper
                : `${styles.contentWrapper} ${styles.clamped}`
            }
          >
            {userRatings.reviewContent || "No written review yet."}
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
                const metric = userRatings.metrics.find(
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
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyRight}>
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
