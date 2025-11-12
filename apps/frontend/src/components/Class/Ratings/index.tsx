import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { UserStar } from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";

import { METRIC_ORDER, MetricName, REQUIRED_METRICS } from "@repo/shared";
import { Color, Container, Select } from "@repo/theme";

import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { DeleteRatingPopup } from "@/components/Class/Ratings/UserFeedbackModal/ConfirmationPopups";
import { useReadTerms } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { IAggregatedRatings, IUserRatingClass } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  CreateRatingDocument,
  DeleteRatingDocument,
  GetAggregatedRatingsDocument,
  Semester,
  TemporalPosition,
} from "@/lib/generated/graphql";
import {
  GetCourseRatingsDocument,
  GetSemestersWithRatingsDocument,
  GetUserRatingsDocument,
} from "@/lib/generated/graphql";

import { RatingButton } from "./RatingButton";
import { RatingDetailProps, RatingDetailView } from "./RatingDetail";
import styles from "./Ratings.module.scss";
import UserRatingSummary from "./UserRatingSummary";
import {
  MetricData,
  checkConstraint,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "./metricsUtil";

// TODO: [CROWD-SOURCED-DATA] rejected mutations are not communicated to the frontend
// TODO: [CROWD-SOURCED-DATA] use multipleClassAggregatedRatings endpoint to get aggregated ratings for a professor

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
  const { class: currentClass, course: currentCourse } = useClass();
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [termRatings, setTermRatings] = useState<IAggregatedRatings | null>(
    null
  );
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: termsData } = useReadTerms();

  // Get user's existing ratings
  const { data: userRatingsData } = useQuery(GetUserRatingsDocument, {
    skip: !user,
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
  const { data: aggregatedRatings } = useQuery(GetCourseRatingsDocument, {
    variables: {
      subject: currentClass?.subject,
      number: currentClass?.courseNumber,
    },
    skip: !currentClass?.subject || !currentClass?.courseNumber,
  });

  // Create rating mutation
  const [createRating] = useMutation(CreateRatingDocument, {
    refetchQueries: [
      "GetUserRatings",
      "GetCourseRatings",
      "GetSemestersWithRatings",
    ],
  });

  const [deleteRating] = useMutation(DeleteRatingDocument, {
    refetchQueries: [
      "GetUserRatings",
      "GetCourseRatings",
      "GetSemestersWithRatings",
    ],
  });

  const [getAggregatedRatings, { data: aggregatedRatingsData }] =
    useLazyQuery<IAggregatedRatings>(GetAggregatedRatingsDocument);

  useEffect(() => {
    setTermRatings(aggregatedRatingsData as IAggregatedRatings | null);
  }, [aggregatedRatingsData]);

  // Get semesters with ratings
  const { data: semestersWithRatingsData } = useQuery(
    GetSemestersWithRatingsDocument,
    {
      variables: {
        subject: currentClass.subject,
        courseNumber: currentClass.courseNumber,
      },
      skip: !currentClass?.subject || !currentClass?.courseNumber,
    }
  );

  const semestersWithRatings = useMemo(() => {
    if (!semestersWithRatingsData) return [];
    return semestersWithRatingsData.semestersWithRatings.filter(
      (sem) => sem.maxMetricCount > 0
    );
  }, [semestersWithRatingsData]);

  const availableTerms = useMemo(() => {
    if (!currentCourse.classes) return [];

    return _.chain(currentCourse.classes.toSorted(sortByTermDescending))
      .filter((c) => {
        // Filter out ghost classes that shouldn't appear in schedule (quick fix for ghost classes -> after database level fix can delete!)
        return c.anyPrintInScheduleOfClasses !== false;
      })
      .map((c) => {
        let allInstructors = "";
        if (c.primarySection) {
          c.primarySection.meetings.forEach((m) => {
            m.instructors.forEach((i) => {
              if (!i.familyName || !i.givenName) return;
              allInstructors = `${allInstructors} ${i.familyName}, ${i.givenName.charAt(0)};`;
            });
          });
          if (allInstructors.length === 0) allInstructors = "(No instructor)";
          else
            allInstructors = `(${allInstructors.substring(1, allInstructors.length - 1)})`;
        }
        return {
          value: `${c.semester} ${c.year} ${c.number}`,
          label: `${c.semester} ${c.year} ${allInstructors}`,
          semester: c.semester as Semester,
          year: c.year,
        };
      })
      .uniqBy((term: any) => `${term.label}`)
      .value();
  }, [currentClass]);

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
    return matchedRating as IUserRatingClass;
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
        statusColor: getStatusColor(
          metric.metricName,
          metric.weightedAverage
        ) as Color,
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

  const termSelectOptions = useMemo(() => {
    const withDuplicates = availableTerms
      .filter((term: Term) => {
        // Filter for past terms
        const termPosition = termsData?.find(
          (t) => t.semester === term.semester && t.year === term.year
        )?.temporalPosition;
        const isValidTerm =
          !termPosition ||
          termPosition === TemporalPosition.Past ||
          termPosition === TemporalPosition.Current;

        // Filter for terms with ratings
        const hasRatingsForTerm = semestersWithRatings?.some(
          (s: { semester: Semester; year: number }) =>
            s.semester === term.semester && s.year === term.year
        );

        return isValidTerm && hasRatingsForTerm;
      })
      .map((t) => ({
        value: `${t.semester} ${t.year}`,
        label: `${t.semester} ${t.year}`,
      }));
    return withDuplicates.filter(
      (v) => withDuplicates.find((v2) => v2.value === v.value) === v
    );
  }, [availableTerms, semestersWithRatings]);

  // const ratingsCount = useMemo(
  //   () => (ratingsData ? ratingsData.reduce((acc, v) => acc + v.reviewCount, 0) : 0),
  //   [ratingsData]
  // );

  const ratingSubmit = async (
    metricValues: MetricData,
    termInfo: { semester: Semester; year: number },
    createRating: any,
    deleteRating: any,
    currentClass: any,
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    currentRatings?: {
      semester: string;
      year: number;
      metrics: Array<{ metricName: string; value: number }>;
    } | null
  ) => {
    try {
      const populatedMetrics = Object.keys(MetricName).filter(
        (metric) =>
          metricValues[MetricName[metric as keyof typeof MetricName]] !==
            null &&
          metricValues[MetricName[metric as keyof typeof MetricName]] !==
            undefined
      );
      if (populatedMetrics.length === 0) {
        throw new Error(`No populated metrics`);
      }
      const missingRequiredMetrics = REQUIRED_METRICS.filter(
        (metric) => !populatedMetrics.includes(metric)
      );
      if (missingRequiredMetrics.length > 0) {
        throw new Error(
          `Missing required metrics: ${missingRequiredMetrics.join(", ")}`
        );
      }
      await Promise.all(
        (Object.keys(MetricName) as Array<keyof typeof MetricName>).map(
          (metric) => {
            const value = metricValues[MetricName[metric]];
            // If metric is not in populated metrics but was in current ratings, delete
            if (!populatedMetrics.includes(metric)) {
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
                  refetchQueries: [
                    "GetClass",
                    "GetUserRatings",
                    "GetCourseRatings",
                    "GetSemestersWithRatings",
                  ],
                });
              }
              // Skip if metric doesn't exist in current ratings
              return Promise.resolve();
            }
            // Check if the current rating value is different from the new value
            if (
              currentRatings?.semester === termInfo.semester &&
              currentRatings?.year === termInfo.year
            ) {
              const currentMetric = currentRatings?.metrics.find(
                (m) => m.metricName === metric
              );
              if (currentMetric?.value === value) {
                return Promise.resolve();
              }
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
              refetchQueries: [
                "GetClass",
                "GetUserRatings",
                "GetCourseRatings",
                "GetSemestersWithRatings",
              ],
              awaitRefetchQueries: true,
            });
          }
        )
      );

      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    }
  };

  const ratingDelete = async (
    userRating: IUserRatingClass,
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
        refetchQueries: [
          "GetClass",
          "GetUserRatings",
          "GetCourseRatings",
          "GetSemestersWithRatings",
        ],
        awaitRefetchQueries: true,
      })
    );
    await Promise.all(deletePromises);
  };

  return (
    <>
      {!hasRatings ? (
        <div className={styles.placeholder}>
          <UserStar width={32} height={32} strokeWidth={1.5} />
          <p className={styles.heading}>No Course Ratings</p>
          <p className={styles.paragraph}>
            This course doesn't have any reviews yet.
            <br />
            Be the first to share your experience!
          </p>
          <RatingButton
            user={user}
            onOpenModal={handleModalStateChange}
            userRatingData={userRatingsData}
            currentClass={currentClass}
          />
        </div>
      ) : (
        <div className={styles.root}>
          <Container size="2">
            {userRatings ? (
              <UserRatingSummary
                userRatings={userRatings}
                onOpenModal={handleModalStateChange}
                ratingDelete={() => setIsDeleteModalOpen(true)}
              />
            ) : (
              <div></div>
            )}
            <div className={styles.header}>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
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
                    <Select
                      options={[
                        { value: "all", label: "Overall Ratings" },
                        ...termSelectOptions,
                      ]}
                      value={selectedTerm}
                      variant="foreground"
                      onChange={async (selectedValue) => {
                        if (Array.isArray(selectedValue) || !selectedValue)
                          return; // ensure it is string
                        setSelectedTerm(selectedValue);
                        if (selectedValue === "all") {
                          setTermRatings(null);
                        } else if (isSemester(selectedValue)) {
                          const [semester, year] = selectedValue.split(" ");
                          const { data } = await getAggregatedRatings({
                            variables: {
                              subject: currentClass.subject,
                              courseNumber: currentClass.courseNumber,
                              semester: semester,
                              year: parseInt(year),
                            },
                          });
                          if (data) setTermRatings(data);
                        }
                      }}
                      placeholder="Select term"
                    />
                  )}
                </div>
              </div>
            </div>
            <div
              className={styles.ratingsBody}
              style={{
                backgroundColor: !hasRatings
                  ? "transparent"
                  : "var(--foreground-color)",
                boxShadow: !hasRatings ? "none" : "0 1px 2px rgb(0 0 0 / 5%)",
                border: !hasRatings ? "none" : "1px solid var(--border-color)",
              }}
            >
              {ratingsData
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
                ))}
            </div>
            {/* // TODO: [CROWD-SOURCED-DATA] add rating count for semester instance */}
            {/* <div>
              {hasRatings && ratingsData && (
                <div className={styles.ratingsCountContainer}>
                  This semester has been rated by {ratingsCount} user
                  {ratingsCount !== 1 ? "s" : ""}
                </div>
              )}
            </div> */}
          </Container>
        </div>
      )}

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
    </>
  );
}

export default RatingsContainer;
