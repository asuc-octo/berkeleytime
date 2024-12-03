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
import { Button, IconButton, Tooltip } from "@repo/theme";
import { signIn } from "@/lib/api";
import { Semester } from "@/lib/api/terms";
import styles from "../Ratings.module.scss";
import UserRatingSummary from "../UserRatingSummary";
import {
  MetricData,
  UserRating,
  formatDate,
  getMetricTooltip
} from "./metricsUtil";

export interface RatingDetailProps {
  metric: MetricName;
  stats: {
    rating: number;
    percentage: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
}

// React Components
export function RatingUserSummary({
  userRatings,
  setModalOpen,
  deleteUserRating,
}: {
  userRatings: UserRating;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteUserRating: Function;
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
            <IconButton onClick={() => setModalOpen(true)}>
              <EditPencil />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete rating">
            <IconButton onClick={() => deleteUserRating(userRatings)}>
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
}: RatingDetailProps) {
  const [isExpanded, setIsExpanded] = useState(true);
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
              <span className={styles.rating}>{stat.rating}</span>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{
                    width: shouldAnimate ? `${stat.percentage}%` : "0%",
                    transitionDelay: `${index * 60}ms`,
                  }}
                />
              </div>
              <span className={styles.percentage}>
                {shouldAnimate ? `${stat.percentage}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RatingButton(
  user: any,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  return user ? (
    <Button
      style={{
        color: "var(--blue-500)",
        backgroundColor: "var(--foreground-color)",
        height: "38px",
      }}
      onClick={() => setModalOpen(true)}
    >
      Add a rating
    </Button>
  ) : (
    <Button
      onClick={() => signIn(window.location.pathname)}
      variant="solid"
      className={styles.button}
      style={{ height: "38px" }}
    >
      Sign in to add ratings
      <ArrowRight />
    </Button>
  );
}

// Utility functions
export const ratingDelete = (
  userRating: UserRating,
  currentClass: any,
  deleteRating: any
) => {
  userRating.metrics.forEach((metric) => {
    deleteRating({
      variables: {
        subject: currentClass.subject,
        courseNumber: currentClass.courseNumber,
        semester: userRating.semester,
        year: userRating.year,
        classNumber: currentClass.number,
        metricName: metric.metricName,
      },
    });
  });
};

export const ratingSubmit = async (
  metricValues: MetricData,
  termInfo: { semester: Semester; year: number },
  createRating: any,
  currentClass: any,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log("Submitting ratings:", metricValues, "for term:", termInfo);
  try {
    await Promise.all(
      (Object.keys(MetricName) as Array<keyof typeof MetricName>)
        // TODO: Remove placeholder data before prod
        .filter((metric) => metric !== "Recommended")
        .map((metric) => {
          return createRating({
            variables: {
              subject: currentClass.subject,
              courseNumber: currentClass.courseNumber,
              semester: termInfo.semester,
              year: termInfo.year,
              classNumber: currentClass.number,
              metricName: metric,
              value: metricValues[MetricName[metric]],
            },
          });
        })
    );

    setModalOpen(false);
  } catch (error) {
    console.error("Error submitting ratings:", error);
  }
};