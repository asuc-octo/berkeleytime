import React, { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import {
  ArrowRight,
  EditPencil,
  InfoCircle,
  NavArrowDown,
  Trash,
} from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";

import { MetricName } from "@repo/shared";
import { Button, Container, IconButton, Tooltip } from "@repo/theme";

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
    onError: (error) => {
      console.error("GET_USER_RATINGS error:", error);
    },
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
    const totalRatings =
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.reduce(
        (acc: number, metric: any) => {
          return acc + metric.count;
        },
        0
      ) ?? 0;
    return totalRatings > 0;
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
            <div className={styles.termSelectWrapper}>
              {hasRatings && (
                <ReactSelect
                  options={[
                    { value: "all", label: "Overall Ratings" },
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
                  onChange={(option) => {
                    const selectedValue = option?.value || "all";
                    // TODO: abstract out to a function
                    setSelectedTerm(selectedValue);
                  }}
                  placeholder="Select term"
                  classNamePrefix="select"
                  className={styles.termSelect}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: "var(--background-color)",
                      borderColor: "var(--border-color)",
                      minHeight: "38px",
                      maxHeight: "38px",
                      width: "200px",
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: "var(--background-color)",
                      border: "1px solid var(--border-color)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused
                        ? "var(--hover-color)"
                        : "transparent",
                      color: "var(--paragraph-color)",
                      cursor: "pointer",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: "var(--paragraph-color)",
                    }),
                    input: (base) => ({
                      ...base,
                      color: "var(--paragraph-color)",
                      maxWidth: "150px",
                      overflow: "hidden",
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
