import React, { useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";

import { Container } from "@repo/theme";

import UserFeedbackModal from "@/components/UserFeedbackModal";
import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import {
  CREATE_RATING,
  DELETE_RATING,
  GET_COURSE_RATINGS,
  GET_USER_RATINGS,
  READ_COURSE,
} from "@/lib/api";
import { Semester } from "@/lib/api/terms";

import styles from "./Ratings.module.scss";
import {
  RatingButton,
  RatingDetailProps,
  RatingDetailView,
  RatingUserSummary,
  ratingDelete,
  ratingSubmit,
} from "./helper/RatingsContainerHelper";
// TODO: Remove placeholder data before prod
import { placeholderRatingsData } from "./helper/devPlaceholderData";
import {
  MetricData,
  UserRating,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "./helper/metricsUtil";

const PLACEHOLDER = false;

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
          <RatingUserSummary
            userRatings={userRatings}
            setModalOpen={setModalOpen}
            deleteUserRating={(userRating: UserRating) =>
              ratingDelete(userRating, currentClass, deleteRating)
            }
          />
        ) : (
          <div></div>
        )}
        <div className={styles.header}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {(hasRatings || PLACEHOLDER) &&
              !userRatings &&
              RatingButton(user, setModalOpen)}
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

        <div
          className={styles.ratingsContainer}
          style={{
            backgroundColor:
              !hasRatings && !PLACEHOLDER
                ? "transparent"
                : "var(--foreground-color)",
            boxShadow:
              !hasRatings && !PLACEHOLDER
                ? "none"
                : "0 1px 2px rgb(0 0 0 / 5%)",
            border: !hasRatings && !PLACEHOLDER ? "none" : "1px solid var(--border-color)",
          }}
        >
          {!hasRatings && !PLACEHOLDER ? (
            <div className={styles.emptyRatings}>
              <p>This course doesn't have any reviews yet.</p>
              <p>Be the first to share your experience!</p>
              {RatingButton(user, setModalOpen)}
            </div>
          ) : (
            ratingsData
              ?.filter((ratingData) => isMetricRating(ratingData.metric))
              .map((ratingData) => (
                <div className={styles.ratingSection} key={ratingData.metric}>
                  <RatingDetailView {...ratingData} />
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
          onSubmit={async (metricValues, termInfo) => {
            try {
              await ratingSubmit(
                metricValues,
                termInfo,
                createRating,
                currentClass,
                setModalOpen
              );
            } catch (error) {
              console.error("Error submitting rating:", error);
            }
          }}
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
