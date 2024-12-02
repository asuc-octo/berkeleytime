import React, { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import { ArrowRight, EditPencil, NavArrowDown, Trash } from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";

import { MetricName } from "@repo/shared";
import {
  Button,
  Container,
  IconButton,
  Tooltip as ThemeTooltip,
} from "@repo/theme";

import UserFeedbackModal from "@/components/UserFeedbackModal";
import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import { signIn } from "@/lib/api";
import {
  CREATE_RATING,
  DELETE_RATING,
  GET_COURSE_RATINGS,
  GET_USER_RATINGS,
  READ_COURSE,
} from "@/lib/api";
import { Semester } from "@/lib/api/terms";

import styles from "./Ratings.module.scss";
import UserRatingSummary from "./UserRatingSummary";
// TODO: Remove placeholder data before prod
import { placeholderRatingsData } from "./helper/devPlaceholderData";
import {
  MetricData,
  UserRating,
  formatDate,
  getMetricStatus,
  getMetricTooltip,
  getStatusColor,
  isMetricRating,
} from "./helper/metricsUtil";

const PLACEHOLDER = false;

function MyRatingSummary({
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
          <ThemeTooltip content="Edit rating">
            <IconButton onClick={() => setModalOpen(true)}>
              <EditPencil />
            </IconButton>
          </ThemeTooltip>
          <ThemeTooltip content="Delete rating">
            <IconButton onClick={() => deleteUserRating(userRatings)}>
              <Trash />
            </IconButton>
          </ThemeTooltip>
        </div>
      </div>
      <div className={styles.userRatingDataContainer}>
        <UserRatingSummary userRatings={userRatings} />
      </div>
    </div>
  );
}

interface RatingDetailProps {
  metric: MetricName;
  stats: {
    rating: number;
    percentage: number;
  }[];
  status: string;
  statusColor: string;
  reviewCount: number;
}

function RatingDetail({
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
            <ThemeTooltip content={`${metric}\n${getMetricTooltip(metric)}`}>
              <span className={styles.info}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.41666 8.9165H6.58332V5.4165H5.41666V8.9165ZM5.99999 4.24984C6.16527 4.24984 6.30391 4.19384 6.41591 4.08184C6.52791 3.96984 6.58371 3.83139 6.58332 3.6665C6.58293 3.50161 6.52693 3.36317 6.41532 3.25117C6.30371 3.13917 6.16527 3.08317 5.99999 3.08317C5.83471 3.08317 5.69627 3.13917 5.58466 3.25117C5.47305 3.36317 5.41705 3.50161 5.41666 3.6665C5.41627 3.83139 5.47227 3.97003 5.58466 4.08242C5.69705 4.19481 5.83549 4.25061 5.99999 4.24984ZM5.99999 11.8332C5.19305 11.8332 4.43471 11.6799 3.72499 11.3735C3.01527 11.0671 2.39791 10.6515 1.87291 10.1269C1.34791 9.60231 0.932379 8.98495 0.626324 8.27484C0.320268 7.56473 0.167046 6.80639 0.166657 5.99984C0.166268 5.19328 0.319491 4.43495 0.626324 3.72484C0.933157 3.01473 1.34869 2.39737 1.87291 1.87275C2.39713 1.34814 3.01449 0.932615 3.72499 0.626171C4.43549 0.319726 5.19382 0.166504 5.99999 0.166504C6.80616 0.166504 7.56449 0.319726 8.27499 0.626171C8.98549 0.932615 9.60285 1.34814 10.1271 1.87275C10.6513 2.39737 11.067 3.01473 11.3742 3.72484C11.6815 4.43495 11.8345 5.19328 11.8333 5.99984C11.8322 6.80639 11.6789 7.56473 11.3737 8.27484C11.0684 8.98495 10.6529 9.60231 10.1271 10.1269C9.6013 10.6515 8.98393 11.0673 8.27499 11.3741C7.56605 11.6809 6.80771 11.8339 5.99999 11.8332ZM5.99999 10.6665C7.30277 10.6665 8.40624 10.2144 9.31041 9.31025C10.2146 8.40609 10.6667 7.30261 10.6667 5.99984C10.6667 4.69706 10.2146 3.59359 9.31041 2.68942C8.40624 1.78525 7.30277 1.33317 5.99999 1.33317C4.69721 1.33317 3.59374 1.78525 2.68957 2.68942C1.78541 3.59359 1.33332 4.69706 1.33332 5.99984C1.33332 7.30261 1.78541 8.40609 2.68957 9.31025C3.59374 10.2144 4.69721 10.6665 5.99999 10.6665Z"
                    fill="#94A3B8"
                  />
                </svg>
              </span>
            </ThemeTooltip>
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

export function RatingsContainer() {
  const [isModalOpen, setModalOpen] = useState(false);
  const { class: currentClass } = useClass();
  const [selectedTerm, setSelectedTerm] = useState("all");
  const { data: user } = useReadUser();
  const [searchParams] = useSearchParams();

  useEffect(() => {}, [user, searchParams]);

  const { data: courseData, loading: courseLoading } = useQuery(READ_COURSE, {
    variables: {
      subject: currentClass.subject,
      number: currentClass.courseNumber,
    },
  });

  // Get user's existing ratings
  const { data: userRatingsData } = useQuery(GET_USER_RATINGS, {
    skip: !user,
  });

  // Get aggregated ratings for display
  const { data: aggregatedRatings } = useQuery(GET_COURSE_RATINGS, {
    variables:
      currentClass?.subject && currentClass?.courseNumber
        ? {
            subject: currentClass.subject,
            number: currentClass.courseNumber,
          }
        : undefined,
    skip: !currentClass?.subject || !currentClass?.courseNumber,
    onCompleted: (data) => {
      console.log("GET_COURSE_RATINGS completed:", data);
    },
    onError: (error) => {
      console.error("GET_COURSE_RATINGS error:", error);
    },
  });

  // Create rating mutation
  const [createRating] = useMutation(CREATE_RATING, {
    refetchQueries: ["GetUserRatings", "GetCourseRatings"],
  });

  const [deleteRating] = useMutation(DELETE_RATING, {
    refetchQueries: ["GetUserRatings", "GetCourseRatings"],
  });

  function deleteUserRating(userRating: UserRating) {
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
  }

  const availableTerms = React.useMemo(() => {
    if (!courseData?.course?.classes) return [];

    return _.chain(courseData.course.classes)
      .map((classInfo) => ({
        value: `${classInfo.semester} ${classInfo.year}`,
        label: `${classInfo.semester} ${classInfo.year}`,
        semester: classInfo.semester as Semester,
        year: classInfo.year,
      }))
      .uniqBy((term) => `${term.semester}-${term.year}`)
      .orderBy(
        [
          "year",
          (term) => {
            const semesterOrder = {
              [Semester.Spring]: 0,
              [Semester.Summer]: 1,
              [Semester.Fall]: 2,
              [Semester.Winter]: 3,
            };
            return semesterOrder[term.semester as Semester];
          },
        ],
        ["desc", "asc"]
      )
      .value();
  }, [courseData]);

  const userRatings = React.useMemo(() => {
    if (!userRatingsData?.userRatings?.classes) return null;

    const matchedRating = userRatingsData.userRatings.classes.find(
      (classRating: {
        subject: string;
        courseNumber: string;
        semester: Semester;
        year: number;
        classNumber: string;
      }) =>
        classRating.subject === currentClass.subject &&
        classRating.courseNumber === currentClass.courseNumber
    ) as UserRating;

    return matchedRating;
  }, [userRatingsData, currentClass]);

  const handleSubmitRatings = async (
    metricValues: MetricData,
    termInfo: { semester: Semester; year: number }
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

  const RatingButton = React.useMemo(() => {
    return user ? (
      <Button
        style={{
          color: "#3B82F6",
          backgroundColor: "var(--foreground-color)",
        }}
        onClick={() => setModalOpen(true)}
      >
        Add a rating
      </Button>
    ) : (
      <Button
        style={{
          color: "white",
          backgroundColor: "#3B82F6",
        }}
        onClick={() => signIn(window.location.pathname)}
      >
        Sign in to add ratings
        <ArrowRight />
      </Button>
    );
  }, [user, setModalOpen]);

  // Transform aggregated ratings into display format
  const ratingsData = React.useMemo(() => {
    if (PLACEHOLDER) {
      return placeholderRatingsData;
    }
    if (!aggregatedRatings?.course?.aggregatedRatings?.metrics) {
      return null;
    }

    return aggregatedRatings.course.aggregatedRatings.metrics.map(
      (metric: any) => {
        const allCategories = [5, 4, 3, 2, 1].map((rating) => {
          const category = metric.categories.find(
            (cat: any) => cat.value === rating
          );
          return {
            rating,
            percentage: category ? (category.count / metric.count) * 100 : 0,
          };
        });

        return {
          metric: metric.metricName,
          stats: allCategories,
          status: getMetricStatus(metric.metricName, metric.weightedAverage),
          statusColor: getStatusColor(metric.weightedAverage),
          reviewCount: metric.count,
        };
      }
    ) as RatingDetailProps[];
  }, [aggregatedRatings]);

  const hasRatings = React.useMemo(() => {
    return (
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.reduce(
        (acc: number, metric: any) => {
          return acc + metric.count;
        },
        0
      ) > 0
    );
  }, [aggregatedRatings]);

  if (courseLoading) {
    return <div>Loading course data...</div>;
  }

  return (
    <div className={styles.root}>
      <Container size="sm">
        {userRatings ? (
          <MyRatingSummary
            userRatings={userRatings}
            setModalOpen={setModalOpen}
            deleteUserRating={deleteUserRating}
          />
        ) : (
          <div></div>
        )}
        <div className={styles.header}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {(hasRatings || PLACEHOLDER) && !userRatings && RatingButton}
            {/* Replace select dropdown with ReactSelect */}
            <div
              style={{
                marginLeft: "auto",
                maxWidth: "300px",
              }}
            >
              {hasRatings && (
                <ReactSelect
                  options={[
                    { value: "all", label: "All Terms" },
                    ...availableTerms,
                  ]}
                  value={
                    availableTerms.find(
                      (term) => term.value === selectedTerm
                    ) || {
                      value: "all",
                      label: "Overall Ratings",
                    }
                  }
                  onChange={(option) => setSelectedTerm(option?.value || "all")}
                  placeholder="Select term"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "var(--foreground-color)",
                      maxHeight: "35px",
                      color: "var(--paragraph-color)",
                      fontSize: "14px",
                      fontWeight: "400",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      minWidth: "231px",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "var(--foreground-color)",
                      color: "var(--paragraph-color)",
                      fontWeight: "400",
                      fontSize: "14px",
                    }),
                    option: (base) => ({
                      ...base,
                      backgroundColor: "var(--foreground-color)",
                      color: "var(--paragraph-color)",
                      border: "none",
                      fontSize: "14px",
                      "&:hover": {
                        backgroundColor: "#3B82F6",
                      },
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "var(--paragraph-color)",
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: "var(--paragraph-color)",
                    }),
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.ratingsContainer}>
          {!hasRatings && !PLACEHOLDER ? (
            <div className={styles.emptyRatings}>
              <p>This course doesn't have any reviews yet.</p>
              <p>Be the first to share your experience!</p>
              {RatingButton}
            </div>
          ) : (
            ratingsData
              ?.filter((ratingData) => isMetricRating(ratingData.metric))
              .map((ratingData) => (
                <div className={styles.ratingSection} key={ratingData.metric}>
                  <RatingDetail {...ratingData} />
                </div>
              ))
          )}
        </div>

        <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Rate Course"
          currentClass={currentClass}
          availableTerms={availableTerms}
          onSubmit={handleSubmitRatings}
          initialMetricData={userRatingsData?.userRatings?.classes
            ?.find(
              (c: {
                subject: string;
                courseNumber: string;
                semester: Semester;
                year: number;
                classNumber: string;
              }) =>
                c.subject === currentClass.subject &&
                c.courseNumber === currentClass.courseNumber &&
                c.semester === currentClass.semester &&
                c.year === currentClass.year &&
                c.classNumber === currentClass.number
            )
            ?.metrics?.reduce(
              (
                acc: MetricData,
                metric: { metricName: string; value: number }
              ) => ({
                ...acc,
                [metric.metricName]: metric.value,
              }),
              {}
            )}
        />
      </Container>
    </div>
  );
}

export default RatingsContainer;
