import { useCallback, useEffect, useMemo, useState } from "react";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import ReactSelect from "react-select";

import { METRIC_ORDER } from "@repo/shared";
import { Container } from "@repo/theme";

import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { DeleteRatingPopup } from "@/components/Class/Ratings/UserFeedbackModal/FeedbackPopups";
import { useReadTerms, useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import {
  CREATE_RATING,
  DELETE_RATING,
  GET_AGGREGATED_RATINGS,
  GET_COURSE_RATINGS,
  GET_SEMESTERS_WITH_RATINGS,
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
  getRatingsCount,
  ratingDelete,
  ratingSubmit,
} from "./helper/RatingsContainerHelper";
import {
  UserRating,
  checkConstraint,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "./helper/metricsUtil";
import { termSelectStyle } from "./helper/termSelectStyle";

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

interface Term {
  semester: Semester;
  year: number;
  value: string;
  label: string;
}

export function RatingsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { class: currentClass } = useClass();
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [termRatings, setTermRatings] = useState<AggregatedRatings | null>(
    null
  );
  const { data: user } = useReadUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: termsData } = useReadTerms();

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

  const handleModalStateChange = useCallback(
    (open: boolean) => {
      setIsModalOpen(open);
      if (open) {
        searchParams.set("feedbackModal", "true");
        setSearchParams(searchParams);
      } else if (searchParams.get("feedbackModal")) {
        searchParams.delete("feedbackModal");
        setSearchParams(searchParams);
      }
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    // Check if we should open/close the modal based on URL parameter
    const feedbackModalParam = searchParams.get("feedbackModal");
    if (user && feedbackModalParam === "true") {
      const canRate = checkConstraint(userRatingsData);
      if (canRate) {
        handleModalStateChange(true);
      } else {
        // Remove the parameter if user can't rate
        searchParams.delete("feedbackModal");
        setSearchParams(searchParams);
      }
    } else if (feedbackModalParam !== "true" && isModalOpen) {
      // Close the modal if the parameter is not present
      handleModalStateChange(false);
    }
  }, [
    user,
    searchParams,
    userRatingsData,
    handleModalStateChange,
    setSearchParams,
    isModalOpen,
  ]);

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
    refetchQueries: [
      "GetUserRatings",
      "GetCourseRatings",
      "GetSemestersWithRatings",
    ],
  });

  const [deleteRating] = useMutation(DELETE_RATING, {
    refetchQueries: [
      "GetUserRatings",
      "GetCourseRatings",
      "GetSemestersWithRatings",
    ],
  });

  const [getAggregatedRatings] = useLazyQuery(GET_AGGREGATED_RATINGS, {
    onCompleted: (data) => {
      setTermRatings(data.aggregatedRatings);
    },
    onError: (error) => {
      console.error("GET_AGGREGATED_RATINGS error:", error);
    },
  });

  // Get semesters with ratings
  const { data: semestersWithRatings } = useQuery(GET_SEMESTERS_WITH_RATINGS, {
    variables:
      currentClass?.subject && currentClass?.courseNumber
        ? {
            subject: currentClass.subject,
            courseNumber: currentClass.courseNumber,
          }
        : undefined,
    skip: !currentClass?.subject || !currentClass?.courseNumber,
  });

  const availableTerms = useMemo(() => {
    if (!courseData?.course?.classes) return [];

    return _.chain(courseData.course.classes)
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
  }, [courseData]);

  const userRatings = useMemo(() => {
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
    return matchedRating as UserRating;
  }, [userRatingsData, currentClass]);

  const ratingsData = useMemo(() => {
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
      let maxCount = 1;
      [5, 4, 3, 2, 1].map((rating) => {
        const category = metric.categories.find(
          (cat: any) => cat.value === rating
        );
        maxCount = Math.max(maxCount, category ? category.count : 0);
      });

      const allCategories = [5, 4, 3, 2, 1].map((rating) => {
        const category = metric.categories.find(
          (cat: any) => cat.value === rating
        );
        return {
          rating,
          count: category ? category.count : 0,
          barPercentage: category ? (category.count / maxCount) * 100 : 0,
        };
      });
      return {
        metric: metric.metricName,
        stats: allCategories,
        status: getMetricStatus(metric.metricName, metric.weightedAverage),
        statusColor: getStatusColor(metric.metricName, metric.weightedAverage),
        reviewCount: metric.count,
        weightedAverage: metric.weightedAverage,
      };
    }) as RatingDetailProps[];
  }, [aggregatedRatings, selectedTerm, termRatings]);

  const hasRatings = useMemo(() => {
    const totalRatings =
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.reduce(
        (total: number, metric: any) => total + metric.count,
        0
      ) ?? 0;
    return totalRatings > 0;
  }, [aggregatedRatings]);

  const ratingsCount = useMemo(
    () => (ratingsData ? getRatingsCount(ratingsData) : 0),
    [ratingsData]
  );

  if (courseLoading) {
    return <div>Loading course data...</div>;
  }
  return (
    <div className={styles.root}>
      <Container size="sm">
        {userRatings ? (
          <RatingUserSummary
            userRatings={userRatings}
            onOpenModal={handleModalStateChange}
            ratingDelete={() => setIsDeleteModalOpen(true)}
          />
        ) : (
          <div></div>
        )}
        <div className={styles.header}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {hasRatings && !userRatings && (
              <RatingButton
                user={user}
                onOpenModal={handleModalStateChange}
                userRatingData={userRatingsData}
                currentClass={currentClass}
              />
            )}
            <div className={styles.termSelectWrapper}>
              {hasRatings && (
                <ReactSelect
                  options={[
                    { value: "all", label: "Overall Ratings" },
                    ...availableTerms.filter((term: Term) => {
                      // Filter for past terms
                      const termPosition = termsData?.find(
                        (t) =>
                          t.semester === term.semester && t.year === term.year
                      )?.temporalPosition;
                      const isValidTerm =
                        termPosition === TemporalPosition.Past ||
                        termPosition === TemporalPosition.Current;

                      // Filter for terms with ratings
                      const hasRatingsForTerm =
                        semestersWithRatings?.semestersWithRatings?.some(
                          (s: { semester: Semester; year: number }) =>
                            s.semester === term.semester && s.year === term.year
                        );

                      return isValidTerm && hasRatingsForTerm;
                    }),
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
                    // Handle both single option and multi-value cases
                    const selectedValue =
                      option && "value" in option ? option.value : "all";
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
                  styles={termSelectStyle}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={styles.ratingsContainer}
          style={{
            backgroundColor: !hasRatings
              ? "transparent"
              : "var(--foreground-color)",
            boxShadow: !hasRatings ? "none" : "0 1px 2px rgb(0 0 0 / 5%)",
            border: !hasRatings ? "none" : "1px solid var(--border-color)",
          }}
        >
          {!hasRatings ? (
            <div className={styles.emptyRatings}>
              <p>This course doesn't have any reviews yet.</p>
              <p>Be the first to share your experience!</p>
              <RatingButton
                user={user}
                onOpenModal={handleModalStateChange}
                userRatingData={userRatingsData}
                currentClass={currentClass}
              />
            </div>
          ) : (
            ratingsData
              ?.filter((ratingData) => isMetricRating(ratingData.metric))
              .sort((a, b) => {
                const indexA = METRIC_ORDER.indexOf(a.metric);
                const indexB = METRIC_ORDER.indexOf(b.metric);
                return indexA - indexB;
              })
              .map((ratingData) => (
                <div className={styles.ratingSection} key={ratingData.metric}>
                  <RatingDetailView {...ratingData} />
                </div>
              ))
          )}
        </div>

        {/* // TODO: [CROWD-SOURCED-DATA] add rating count for semester instance */}
        {/* <div>
          {hasRatings && ratingsData && selectedTerm !== "all" && (
            <div className={styles.ratingsCountContainer}>
              This semester has been rated by {ratingsCount} user
              {ratingsCount !== 1 ? "s" : ""}
            </div>
          )}
        </div> */}

        <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => handleModalStateChange(false)}
          title={userRatings ? "Edit Rating" : "Rate Course"}
          currentClass={currentClass}
          availableTerms={availableTerms}
          onSubmit={async (metricValues, termInfo) => {
            try {
              await ratingSubmit(
                metricValues,
                termInfo,
                createRating,
                deleteRating,
                currentClass,
                setIsModalOpen,
                userRatings
              );
            } catch (error) {
              console.error("Error submitting rating:", error);
            }
          }}
          initialUserClass={userRatings}
        />

        <DeleteRatingPopup
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
          }}
          onConfirmDelete={async () => {
            if (userRatings) {
              await ratingDelete(userRatings, currentClass, deleteRating);
            }
          }}
        />
      </Container>
    </div>
  );
}

export default RatingsContainer;
