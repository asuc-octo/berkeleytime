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
import {
  IAggregatedRatings,
  IClass,
  IMetric,
  IUserRatingClass,
} from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  CreateRatingDocument,
  DeleteRatingDocument,
  GetAggregatedRatingsDocument,
  GetClassDocument,
  GetCourseRatingsDocument,
  GetSemestersWithRatingsDocument,
  GetUserRatingsDocument,
  Semester,
  TemporalPosition,
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

type MetricCategory = NonNullable<NonNullable<IMetric["categories"]>[number]>;

const RATING_VALUES = [5, 4, 3, 2, 1] as const;
const METRIC_NAMES = Object.values(MetricName) as MetricName[];

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
  const [createRating] = useMutation(CreateRatingDocument);

  const [deleteRating] = useMutation(DeleteRatingDocument);

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

    const courseTerms: Term[] = currentCourse.classes
      .toSorted(sortByTermDescending)
      .filter((c) => c.anyPrintInScheduleOfClasses !== false)
      .filter((c) => {
        // Filter out classes that haven't started yet
        if (c.primarySection?.startDate) {
          const startDate = new Date(c.primarySection.startDate);
          const today = new Date();
          return startDate <= today;
        }
        // If no startDate, include the class (backward compatibility)
        return true;
      })
      .map((c) => {
        let instructorText = "";
        if (c.primarySection) {
          // Collect all instructors from all meetings
          const allInstructors: Array<{ givenName: string; familyName: string }> = [];
          c.primarySection.meetings.forEach((meeting) => {
            meeting.instructors.forEach((instructor) => {
              if (instructor.familyName && instructor.givenName) {
                allInstructors.push(instructor);
              }
            });
          });

          // Format like the Details component: show first instructor, add "et al." if multiple
          if (allInstructors.length === 0) {
            instructorText = "(No instructor)";
          } else if (allInstructors.length === 1) {
            instructorText = `(${allInstructors[0].givenName} ${allInstructors[0].familyName})`;
          } else {
            instructorText = `(${allInstructors[0].givenName} ${allInstructors[0].familyName}, et al.)`;
          }
        }
        return {
          value: `${c.semester} ${c.year} ${c.number}`,
          label: `${c.semester} ${c.year} ${instructorText}`,
          semester: c.semester as Semester,
          year: c.year,
        } satisfies Term;
      });

    return _.uniqBy(courseTerms, (term) => term.label);
  }, [currentCourse]);

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

  const ratingsData = useMemo<RatingDetailProps[] | null>(() => {
    const metricsSource =
      selectedTerm !== "all" && termRatings?.metrics
        ? termRatings.metrics
        : aggregatedRatings?.course?.aggregatedRatings?.metrics;

    const metrics =
      metricsSource?.filter((metric): metric is IMetric => Boolean(metric)) ??
      [];

    if (
      !metrics.some(
        (metric) => isMetricRating(metric.metricName) && metric.count !== 0
      )
    ) {
      return null;
    }

    return metrics.map((metric) => {
      const categories =
        metric.categories?.filter((category): category is MetricCategory =>
          Boolean(category)
        ) ?? [];

      let maxCount = 1;
      RATING_VALUES.forEach((rating) => {
        const category = categories.find((cat) => cat.value === rating);
        maxCount = Math.max(maxCount, category?.count ?? 0);
      });

      const stats = RATING_VALUES.map((rating) => {
        const category = categories.find((cat) => cat.value === rating);
        const count = category?.count ?? 0;
        return {
          rating,
          count,
          barPercentage: maxCount > 0 ? (count / maxCount) * 100 : 0,
        };
      });

      return {
        metric: metric.metricName,
        stats,
        status: getMetricStatus(metric.metricName, metric.weightedAverage),
        statusColor: getStatusColor(
          metric.metricName,
          metric.weightedAverage
        ) as Color,
        reviewCount: metric.count,
        weightedAverage: metric.weightedAverage,
      } satisfies RatingDetailProps;
    });
  }, [aggregatedRatings, selectedTerm, termRatings]);

  const hasRatings = useMemo(() => {
    const metrics =
      aggregatedRatings?.course?.aggregatedRatings?.metrics?.filter(
        (metric): metric is IMetric => Boolean(metric)
      ) ?? [];
    const totalRatings = metrics.reduce(
      (total, metric) => total + (metric.count ?? 0),
      0
    );
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
  }, [availableTerms, semestersWithRatings, termsData]);

  // const ratingsCount = useMemo(
  //   () => (ratingsData ? ratingsData.reduce((acc, v) => acc + v.reviewCount, 0) : 0),
  //   [ratingsData]
  // );

  const getRefetchQueries = (classData: IClass) => {
    const queries = [
      {
        query: GetClassDocument,
        variables: {
          year: classData.year,
          semester: classData.semester,
          subject: classData.subject,
          courseNumber: classData.courseNumber,
          number: classData.number,
          sessionId: classData.sessionId ?? null,
        },
      },
      {
        query: GetCourseRatingsDocument,
        variables: {
          subject: classData.subject,
          number: classData.courseNumber,
        },
      },
      {
        query: GetSemestersWithRatingsDocument,
        variables: {
          subject: classData.subject,
          courseNumber: classData.courseNumber,
        },
      },
    ];

    if (user) {
      queries.push({ query: GetUserRatingsDocument });
    }

    return queries;
  };

  const ratingSubmit = async (
    metricValues: MetricData,
    termInfo: { semester: Semester; year: number },
    createRatingMutation: typeof createRating,
    deleteRatingMutation: typeof deleteRating,
    currentClassData: IClass,
    setModalOpen: Dispatch<SetStateAction<boolean>>,
    currentRatings?: IUserRatingClass | null
  ) => {
    try {
      const populatedMetrics = METRIC_NAMES.filter((metricName) => {
        const value = metricValues[metricName];
        return value !== null && value !== undefined;
      });
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
      const refetchQueries = getRefetchQueries(currentClassData);

      await Promise.all(
        METRIC_NAMES.map((metric) => {
          const value = metricValues[metric];
          // If metric is not in populated metrics but was in current ratings, delete
          if (!populatedMetrics.includes(metric)) {
            const metricExists = currentRatings?.metrics?.some(
              (m) => m.metricName === metric
            );
            if (metricExists) {
              return deleteRatingMutation({
                variables: {
                  subject: currentClassData.subject,
                  courseNumber: currentClassData.courseNumber,
                  semester: termInfo.semester,
                  year: termInfo.year,
                  classNumber: currentClassData.number,
                  metricName: metric,
                },
                refetchQueries,
                awaitRefetchQueries: true,
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
          if (value === undefined) {
            return Promise.resolve();
          }
          return createRatingMutation({
            variables: {
              subject: currentClassData.subject,
              courseNumber: currentClassData.courseNumber,
              semester: termInfo.semester,
              year: termInfo.year,
              classNumber: currentClassData.number,
              metricName: metric,
              value,
            },
            refetchQueries,
            awaitRefetchQueries: true,
          });
        })
      );

      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    }
  };

  const ratingDelete = async (
    userRating: IUserRatingClass,
    currentClassData: IClass,
    deleteRatingMutation: typeof deleteRating
  ) => {
    const refetchQueries = getRefetchQueries(currentClassData);
    const deletePromises = userRating.metrics.map((metric) =>
      deleteRatingMutation({
        variables: {
          subject: currentClassData.subject,
          courseNumber: currentClassData.courseNumber,
          semester: userRating.semester,
          year: userRating.year,
          classNumber: currentClassData.number,
          metricName: metric.metricName,
        },
        refetchQueries,
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
