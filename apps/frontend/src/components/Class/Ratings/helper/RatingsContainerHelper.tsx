import React, { useState } from "react";

import {
  ArrowRight,
  EditPencil,
  InfoCircle,
  NavArrowDown,
  Trash,
} from "iconoir-react";
import _ from "lodash";

import { MetricName } from "@repo/shared";
import { AlternateTooltip, Button, IconButton, Tooltip } from "@repo/theme";

import { signIn } from "@/lib/api";
import { Semester } from "@/lib/api/terms";

import styles from "../Ratings.module.scss";
import UserRatingSummary from "../UserRatingSummary";
import {
  MetricData,
  UserRating,
  formatDate,
  getMetricTooltip,
} from "./metricsUtil";

export interface RatingDetailProps {
  metric: MetricName;
  stats: {
    rating: number;
    barPercentage: number;
    count: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
  weightedAverage: number;
}

// React Components
export function RatingUserSummary({
  userRatings,
  onOpenModal,
  ratingDelete,
}: {
  userRatings: UserRating;
  onOpenModal: (open: boolean) => void;
  ratingDelete: () => void;
}) {
  return (
    <div className={styles.userRatingContainer}>
      <div className={styles.userRatingTitleContainer}>
        <div>
          <h3>Your Rating Summary</h3>
          <h5>{formatDate(new Date(userRatings.lastUpdated))}</h5>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Tooltip content="Edit rating">
            <IconButton onClick={() => onOpenModal(true)}>
              <EditPencil />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete rating">
            <IconButton onClick={() => ratingDelete()}>
              <Trash />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <div className={styles.userRatingDataContainer}>
        <UserRatingSummary userRatings={userRatings} />
      </div>
    </div>
  );
}

export function RatingDetailView({
  metric,
  stats,
  status,
  statusColor,
  reviewCount,
  weightedAverage,
}: RatingDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExpanded) {
      setShouldAnimate(false);
      requestAnimationFrame(() => {
        timer = setTimeout(() => {
          setShouldAnimate(true);
        }, 50);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isExpanded]);

  return (
    <div className={styles.ratingSection}>
      <div
        className={styles.ratingHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.titleAndStatusSection}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{metric}</h3>
            <Tooltip content={`${getMetricTooltip(metric)}`}>
              <span className={styles.info}>
                <InfoCircle width={14} height={14} />
              </span>
            </Tooltip>
          </div>
          <span className={styles[statusColor]}>{status}</span>
          <span
            className={styles.metricAverage}
          >{`${weightedAverage.toFixed(1)} / 5.0`}</span>
        </div>
        <div className={styles.statusSection}>
          <NavArrowDown
            className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}
          />
        </div>
      </div>
      {isExpanded && (
        <div className={styles.ratingContent}>
          {stats.map((stat, index) => (
            <div
              key={stat.rating}
              className={styles.statRow}
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <span className={styles.metric}>{stat.rating}</span>
              <div className={styles.barContainer}>
                <AlternateTooltip
                  content={`${Math.round((stat.count * 100) / reviewCount)}% of users left this rating`}
                >
                  <div
                    className={styles.bar}
                    style={{
                      width: shouldAnimate ? `${stat.barPercentage}%` : "0%",
                      transitionDelay: `${index * 60}ms`,
                    }}
                  />
                </AlternateTooltip>
              </div>
              <span
                className={`${styles.count} ${stat.count === 0 ? styles.empty : ""}`}
              >
                {shouldAnimate ? `${stat.count}` : "0%"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RatingButton(user: any, onOpenModal: (open: boolean) => void) {
  if (user) {
    return (
      <Button className={styles.ratingButton} onClick={() => onOpenModal(true)}>
        Add a rating
      </Button>
    );
  } else {
    const currentPath = window.location.pathname;
    const redirectPath = `${currentPath}?feedbackModal=true`;
    return (
      <Button
        onClick={() => signIn(redirectPath)}
        className={styles.ratingButton}
      >
        Sign in to add ratings
        <ArrowRight />
      </Button>
    );
  }
}

// Utility functions
export const ratingDelete = async (
  userRating: UserRating,
  currentClass: any,
  deleteRating: any
) => {
  const deletePromises = userRating.metrics.map((metric) =>
    deleteRating({
      variables: {
        subject: currentClass.subject,
        courseNumber: currentClass.courseNumber,
        semester: userRating.semester,
        year: userRating.year,
        classNumber: currentClass.number,
        metricName: metric.metricName,
      },
    })
  );
  await Promise.all(deletePromises);
};

export const ratingSubmit = async (
  metricValues: MetricData,
  termInfo: { semester: Semester; year: number },
  createRating: any,
  deleteRating: any,
  currentClass: any,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  currentRatings?: {
    metrics: Array<{ metricName: string; value: number }>;
  } | null
) => {
  try {
    await Promise.all(
      (Object.keys(MetricName) as Array<keyof typeof MetricName>).map(
        (metric) => {
          const value = metricValues[MetricName[metric]];
          // If value is null or undefined, only send deleteRating if the metric exists in current ratings
          if (value === null || value === undefined) {
            const metricExists = currentRatings?.metrics?.some(
              (m) => m.metricName === metric
            );
            if (metricExists) {
              return deleteRating({
                variables: {
                  subject: currentClass.subject,
                  courseNumber: currentClass.courseNumber,
                  semester: termInfo.semester,
                  year: termInfo.year,
                  classNumber: currentClass.number,
                  metricName: metric,
                },
              });
            }
            // Skip if metric doesn't exist in current ratings
            return Promise.resolve();
          }
          // Check if the current rating value is different from the new value
          const currentMetric = currentRatings?.metrics.find(
            (m) => m.metricName === metric
          );
          if (currentMetric?.value === value) {
            return Promise.resolve();
          }
          return createRating({
            variables: {
              subject: currentClass.subject,
              courseNumber: currentClass.courseNumber,
              semester: termInfo.semester,
              year: termInfo.year,
              classNumber: currentClass.number,
              metricName: metric,
              value,
            },
          });
        }
      )
    );

    setModalOpen(false);
  } catch (error) {
    console.error("Error submitting ratings:", error);
  }
};
