import { useCallback, useEffect, useMemo, useState } from "react";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { UserStar } from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";

import { METRIC_ORDER } from "@repo/shared";
import { Color, Container, Select } from "@repo/theme";

import {
  DeleteRatingPopup,
  ErrorDialog,
} from "@/components/Class/Ratings/RatingDialog";
import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { useReadTerms } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import {
  IAggregatedRatings,
  IClassDetails,
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
  ReadCourseClassesForRatingsDocument,
  Semester,
  TemporalPosition,
} from "@/lib/generated/graphql";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";

import { RatingButton } from "./RatingButton";
import { RatingDetailProps, RatingDetailView } from "./RatingDetail";
import styles from "./Ratings.module.scss";
import UserRatingSummary from "./UserRatingSummary";
import {
  checkConstraint,
  formatInstructorText,
  getMetricStatus,
  getStatusColor,
  isMetricRating,
} from "./metricsUtil";
import {
  deleteRating as deleteRatingHelper,
  submitRating as submitRatingMutation,
} from "./ratingMutations";

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

export function RatingsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const { class: currentClass } = useClass();
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

  const { data: courseClassesData } = useQuery(
    ReadCourseClassesForRatingsDocument,
    {
      variables: {
        subject: currentClass.subject,
        number: currentClass.courseNumber,
      },
      skip: !currentClass?.subject || !currentClass?.courseNumber,
    }
  );

  const courseClasses =
    courseClassesData?.course?.classes?.filter(
      (courseClass): courseClass is NonNullable<typeof courseClass> =>
        Boolean(courseClass)
    ) ?? [];

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
  const [createRatingMutation] = useMutation(CreateRatingDocument);

  const [deleteRatingMutation] = useMutation(DeleteRatingDocument);

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
    if (!courseClasses.length) return [];

    const today = new Date();
    const courseTerms: Term[] = courseClasses
      .toSorted(sortByTermDescending)
      .filter((c) => c.anyPrintInScheduleOfClasses !== false)
      .filter((c) => {
        if (c.primarySection?.startDate) {
          const startDate = new Date(c.primarySection.startDate);
          return startDate <= today;
        }
        return true;
      })
      .map((c) => {
        const instructorText = formatInstructorText(c.primarySection);
        return {
          value: `${c.semester} ${c.year} ${c.number}`,
          label: `${c.semester} ${c.year} ${instructorText}`,
          semester: c.semester as Semester,
          year: c.year,
        } satisfies Term;
      });

    return _.uniqBy(courseTerms, (term) => term.label);
  }, [courseClasses]);

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

  const getRefetchQueries = (classData: IClassDetails) => {
    const queries: Array<
      | {
          query: typeof GetClassDocument;
          variables: {
            year: number;
            semester: Semester;
            subject: string;
            courseNumber: string;
            number: string;
            sessionId: string | null;
          };
        }
      | {
          query: typeof GetCourseRatingsDocument;
          variables: { subject: string; number: string };
        }
      | {
          query: typeof GetSemestersWithRatingsDocument;
          variables: { subject: string; courseNumber: string };
        }
      | { query: typeof GetUserRatingsDocument }
    > = [
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
            await submitRatingMutation({
              metricValues,
              termInfo,
              createRatingMutation,
              deleteRatingMutation,
              classIdentifiers: {
                subject: currentClass.subject,
                courseNumber: currentClass.courseNumber,
                number: currentClass.number,
              },
              currentRatings: userRatings,
              refetchQueries: getRefetchQueries(currentClass),
            });
            setIsModalOpen(false);
          } catch (error) {
            const message = getRatingErrorMessage(error);
            setErrorMessage(message);
            setIsErrorDialogOpen(true);
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
            try {
              await deleteRatingHelper({
                userRating: userRatings,
                deleteRatingMutation,
                classIdentifiers: {
                  subject: currentClass.subject,
                  courseNumber: currentClass.courseNumber,
                  number: currentClass.number,
                },
                refetchQueries: getRefetchQueries(currentClass),
              });
              setIsDeleteModalOpen(false);
            } catch (error) {
              const message = getRatingErrorMessage(error);
              setErrorMessage(message);
              setIsErrorDialogOpen(true);
            }
          }
        }}
      />

      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        errorMessage={errorMessage}
      />
    </>
  );
}

export default RatingsContainer;
