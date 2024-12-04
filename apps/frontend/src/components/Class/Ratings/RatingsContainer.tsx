import React, { useEffect, useState } from "react";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";

import { Container } from "@repo/theme";

import UserFeedbackModal from "@/components/UserFeedbackModal";
import { useReadUser, useReadTerms } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import {
  CREATE_RATING,
  DELETE_RATING,
  GET_AGGREGATED_RATINGS,
  GET_COURSE_RATINGS,
  GET_USER_RATINGS,
  READ_COURSE,
} from "@/lib/api";
import { Semester, TemporalPosition } from "@/lib/api/terms";

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
  UserRating,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "./helper/metricsUtil";

const PLACEHOLDER = false;

interface AggregatedRatings {
  metrics: {
    metricName: string;
    count: number;
    weightedAverage: number;
    categories: {
      value: number;
      count: number;
    }[];
  }[];
}

const isSemester = (value: string): boolean => {
  const firstWord = value.split(" ")[0];
  return Object.values(Semester).includes(firstWord as Semester);
};

const filterPastTerms = (terms: any[], termsData: any[] | undefined) => {
  if (!termsData) return terms;
  const termPositions = termsData.reduce(
    (acc: Record<string, TemporalPosition>, term: any) => {
      acc[`${term.semester} ${term.year}`] = term.temporalPosition;
    return acc;
  }, {});
  const filteredTerms = terms.filter(term => {
    const position = termPositions[term.value];
    return position === TemporalPosition.Past;
  });

  return filteredTerms;
};

export function RatingsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { class: currentClass } = useClass();
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [termRatings, setTermRatings] = useState<AggregatedRatings | null>(
    null
  );
  const { data: user } = useReadUser();
  const [searchParams] = useSearchParams();
  const { data: termsData } = useReadTerms();

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

  const [getAggregatedRatings] = useLazyQuery(GET_AGGREGATED_RATINGS, {
    onCompleted: (data) => {
      console.log("GET_AGGREGATED_RATINGS completed:", data);
      setTermRatings(data.aggregatedRatings);
    },
    onError: (error) => {
      console.error("GET_AGGREGATED_RATINGS error:", error);
    },
  });

  const availableTerms = React.useMemo(() => {
    if (!courseData?.course?.classes) return [];

    const terms = _.chain(courseData.course.classes)
      .map((ClassData: any) => ({
        value: `${ClassData.semester} ${ClassData.year}`,
        label: `${ClassData.semester} ${ClassData.year}`,
        semester: ClassData.semester as Semester,
        year: ClassData.year,
      }))
      .uniqBy((term: any) => `${term.semester}-${term.year}`)
      .orderBy(
        [
          "year",
          (term: any) => {
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

    const filtered = filterPastTerms(terms, termsData);
    return filtered;
  }, [courseData, termsData]);

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
    );
    return matchedRating as UserRating; //toUserRating(JSON.parse(JSON.stringify(matchedRating)))
  }, [userRatingsData, currentClass]);

  const ratingsData = React.useMemo(() => {
    if (PLACEHOLDER) {
      return placeholderRatingsData;
    }

    // Use term-specific ratings if available, otherwise use overall ratings
    const metrics =
      selectedTerm !== "all" && termRatings?.metrics
        ? termRatings.metrics
        : aggregatedRatings?.course?.aggregatedRatings?.metrics;

    if (
      !metrics ||
      !metrics.some(
        (metric: any) => isMetricRating(metric.metricName) && metric.count !== 0
      )
    ) {
      return null;
    }

    return metrics.map((metric: any) => {
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
        statusColor: getStatusColor(metric.metricName, metric.weightedAverage),
        reviewCount: metric.count,
      };
    }) as RatingDetailProps[];
  }, [aggregatedRatings, selectedTerm, termRatings]);

  const hasRatings = React.useMemo(() => {
    const totalRatings =
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.reduce(
        (total: number, metric: any) => total + metric.count,
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
            setIsModalOpen={setIsModalOpen}
            ratingDelete={(userRating: UserRating) =>
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
              RatingButton(user, setIsModalOpen)}
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
                    setSelectedTerm(selectedValue);
                    if (selectedValue === "all") {
                      setTermRatings(null);
                    } else if (isSemester(selectedValue)) {
                      const [semester, year] = selectedValue.split(" ");
                      getAggregatedRatings({
                        variables: {
                          subject: currentClass.subject,
                          courseNumber: currentClass.courseNumber,
                          semester: semester,
                          year: parseInt(year),
                          classNumber: currentClass.number,
                        },
                      });
                    }
                  }}
                  isClearable={true}
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
                      "&:hover": {
                        color: "white",
                      },
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
                    clearIndicator: (base, { getValue }) => ({
                      ...base,
                      display: getValue()[0]?.value === "all" ? "none" : "flex",
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
            border:
              !hasRatings && !PLACEHOLDER
                ? "none"
                : "1px solid var(--border-color)",
          }}
        >
          {!hasRatings && !PLACEHOLDER ? (
            <div className={styles.emptyRatings}>
              <p>This course doesn't have any reviews yet.</p>
              <p>Be the first to share your experience!</p>
              {RatingButton(user, setIsModalOpen)}
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
          onClose={() => setIsModalOpen(false)}
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
                setIsModalOpen
              );
            } catch (error) {
              console.error("Error submitting rating:", error);
            }
          }}
          initialUserClass={userRatings}
        />
      </Container>
    </div>
  );
}

export default RatingsContainer;
