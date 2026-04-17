import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import { EditPencil, Trash, UserStar } from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";

import { METRIC_ORDER, MetricName } from "@repo/shared";
import {
  Box,
  Button,
  Color,
  Container,
  Flex,
  IconButton,
  Select,
  Tooltip,
} from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import {
  DeleteRatingPopup,
  ErrorDialog,
  SubmitRatingPopup,
} from "@/components/Class/Ratings/RatingDialog";
import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { useReadTerms } from "@/hooks/api";
import { useGetClassRatingsData } from "@/hooks/api/ratings/useGetRatings";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { IMetric } from "@/lib/api";
import { GET_CLASS_REVIEWS } from "@/lib/api/ratings";
import { sortByTermDescending } from "@/lib/classes";
import {
  CreateRatingsDocument,
  DeleteRatingsDocument,
  GetUserRatingsDocument,
  Semester,
  TemporalPosition,
} from "@/lib/generated/graphql";
import { getRatingErrorMessage } from "@/utils/ratingErrorMessages";
import { clampCount } from "@/utils/ratings";

import ClassRatingSummary, { type ClassUserReview } from "./ClassRatingSummary";
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

interface Term {
  semester: Semester;
  year: number;
  value: string;
  label: string;
  classNumber?: string;
}

type MetricCategory = NonNullable<NonNullable<IMetric["categories"]>[number]>;

type ClassReviewsMetric = { metricName: MetricName; value: number };
type ClassReviewsQueryData = {
  classReviews?: {
    users?: Array<{
      anonymousUserId?: string;
      classes?: Array<{
        semester?: string | null;
        year?: number | null;
        professorName?: string | null;
        reviewTitle?: string | null;
        reviewContent?: string | null;
        reviewerGrade?: string | null;
        lastUpdated?: string | null;
        metrics?: ClassReviewsMetric[];
        reviewId?: string | null;
        helpfulCount?: number | null;
      }>;
    }>;
  };
};

function RatingCountWithButton({
  count,
  addRatingButton,
}: {
  count: number;
  addRatingButton?: React.ReactNode;
}) {
  const countLabel =
    count === 0 ? "No ratings" : count === 1 ? "1 rating" : `${count} ratings`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3, 12px)",
      }}
    >
      <p className={styles.ratingsSummaryCount}>{countLabel}</p>
      {addRatingButton}
    </div>
  );
}

const RATING_VALUES = [5, 4, 3, 2, 1] as const;
const RATING_TABS = {
  Instructor: "instructor",
  Semester: "semester",
} as const;

export function RatingsContainer() {
  const { class: currentClass } = useClass();
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: termsData } = useReadTerms();

  const [activeRatingTab, setActiveRatingTab] = useState<string>(
    RATING_TABS.Instructor
  );
  const [selectedValue, setSelectedValue] = useState("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [instructorChosen, setInstructorChosen] = useState(false);
  const [semesterChosen, setSemesterChosen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [isSubmitRatingPopupOpen, setIsSubmitRatingPopupOpen] = useState(false);

  const {
    data: ratingsQueryData,
    aggregatedRatings: aggregatedRatingsData,
    instructorAggregatedRatings,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    refetch: refetchAllRatings,
  } = useGetClassRatingsData({
    subject: currentClass.subject,
    courseNumber: currentClass.courseNumber,
  });

  const { data: userRatingsQueryData, refetch: refetchUserRatings } = useQuery(
    GetUserRatingsDocument,
    {
      skip: !user,
      fetchPolicy: "cache-and-network",
    }
  );
  const { data: classRatingsData } = useQuery<ClassReviewsQueryData>(
    GET_CLASS_REVIEWS,
    {
      variables: {
        subject: currentClass.subject,
        courseNumber: currentClass.courseNumber,
      },
      fetchPolicy: "cache-and-network",
    }
  );
  const userRatingsData = userRatingsQueryData?.userRatings;
  const userRatings = useMemo(() => {
    if (!userRatingsData?.classes) return null;
    return (
      userRatingsData.classes.find(
        (classRating) =>
          classRating.subject === currentClass.subject &&
          classRating.courseNumber === currentClass.courseNumber
      ) ?? null
    );
  }, [
    currentClass.courseNumber,
    currentClass.subject,
    userRatingsData?.classes,
  ]);

  const userRatedClasses = useMemo(() => {
    const ratedClasses =
      userRatingsData?.classes?.map((cls) => ({
        subject: cls.subject,
        courseNumber: cls.courseNumber,
      })) ?? [];

    const seen = new Set<string>();
    return ratedClasses.filter((cls) => {
      const key = `${cls.subject}-${cls.courseNumber}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [userRatingsData]);
  const [isModalOpen, setIsModalOpen] = useState(() => {
    return searchParams.get("feedbackModal") === "true";
  });

  useEffect(() => {
    // Reset to "all" if aggregated ratings change (e.g., course switch)
    setSelectedValue("all");
    setActiveRatingTab(RATING_TABS.Instructor);
    setSortBy(null);
    setInstructorChosen(false);
    setSemesterChosen(false);
  }, [aggregatedRatingsData]);

  const handleModalStateChange = useCallback(
    (open: boolean) => {
      setIsModalOpen(open);
      const newParams = new URLSearchParams(searchParams);
      if (open) {
        newParams.set("feedbackModal", "true");
      } else {
        newParams.delete("feedbackModal");
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    const feedbackModalParam = searchParams.get("feedbackModal");
    const shouldBeOpen = feedbackModalParam === "true";

    if (shouldBeOpen !== isModalOpen && user) {
      const canRate = checkConstraint(userRatingsData);
      if (shouldBeOpen && canRate) {
        setIsModalOpen(true);
      } else if (!shouldBeOpen) {
        setIsModalOpen(false);
      }
    }
  }, [searchParams]); // Deliberately minimal dependencies

  const [createRatingsMutation] = useMutation(CreateRatingsDocument);
  const [deleteRatingsMutation] = useMutation(DeleteRatingsDocument);

  const availableTerms = useMemo(() => {
    if (!courseClasses.length) return [];

    // Deduplicate early by semester + year + instructor (before mapping)
    const uniqueClasses = _.uniqBy(
      courseClasses,
      (c) => `${c.semester} ${c.year} ${formatInstructorText(c.primarySection)}`
    );

    const today = new Date();
    const courseTerms: Term[] = uniqueClasses
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
        const value = `${c.semester} ${c.year} ${c.number}`;
        return {
          value,
          label: `${c.semester} ${c.year} ${instructorText}`,
          semester: c.semester as Semester,
          year: c.year,
          classNumber: c.number,
        } satisfies Term;
      });

    return courseTerms;
  }, [courseClasses]);

  const ratingsData = useMemo<RatingDetailProps[] | null>(() => {
    const metrics =
      aggregatedRatingsData?.metrics?.filter((metric): metric is IMetric =>
        Boolean(metric)
      ) ?? [];

    if (
      !metrics.some(
        (metric: IMetric) =>
          isMetricRating(metric.metricName) && metric.count !== 0
      )
    ) {
      return null;
    }

    return metrics.map((metric: IMetric) => {
      const categories =
        metric.categories?.filter((category): category is MetricCategory =>
          Boolean(category)
        ) ?? [];

      let maxCount = 1;
      RATING_VALUES.forEach((rating) => {
        const category = categories.find(
          (cat: MetricCategory) => cat.value === rating
        );
        maxCount = Math.max(maxCount, clampCount(category?.count));
      });

      const stats = RATING_VALUES.map((rating) => {
        const category = categories.find(
          (cat: MetricCategory) => cat.value === rating
        );
        const count = clampCount(category?.count);
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
        reviewCount: clampCount(metric.count),
        weightedAverage: metric.weightedAverage,
      } satisfies RatingDetailProps;
    });
  }, [aggregatedRatingsData]);

  const formatRatingCount = useCallback((count?: number | null) => {
    const normalizedCount = clampCount(count);
    return `${normalizedCount}`;
  }, []);

  const getMaxMetricCount = useCallback(
    (metrics?: (IMetric | null | undefined)[]) =>
      (metrics ?? []).reduce(
        (max, metric) => Math.max(max, clampCount(metric?.count)),
        0
      ),
    []
  );

  const termSelectOptions = useMemo(() => {
    const courseRatingCount = getMaxMetricCount(aggregatedRatingsData?.metrics);

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
        classNumber: t.classNumber,
        count:
          semestersWithRatings?.find(
            (s) => s.semester === t.semester && s.year === t.year
          )?.maxMetricCount ?? 0,
      }));
    const uniqueOptions = withDuplicates.filter(
      (v) => withDuplicates.find((v2) => v2.value === v.value) === v
    );

    // Sort chronologically (newest first) for semester dropdown
    const sortedOptions = [...uniqueOptions].sort((a, b) => {
      const [aSem, aYearStr] = a.value.split(" ");
      const [bSem, bYearStr] = b.value.split(" ");
      const aYear = parseInt(aYearStr, 10);
      const bYear = parseInt(bYearStr, 10);

      if (aYear !== bYear) return bYear - aYear;

      return sortByTermDescending(
        { semester: bSem as Semester, year: bYear },
        { semester: aSem as Semester, year: aYear }
      );
    });

    return [
      {
        value: "all",
        label: "All Results",
        meta: formatRatingCount(courseRatingCount),
        classNumber: undefined,
      },
      ...sortedOptions.map((option) => ({
        value: option.value,
        label: option.label,
        meta: formatRatingCount(option.count),
        classNumber: option.classNumber,
      })),
    ];
  }, [
    aggregatedRatingsData?.metrics,
    availableTerms,
    formatRatingCount,
    getMaxMetricCount,
    semestersWithRatings,
    termsData,
  ]);

  const instructorSelectOptions = useMemo(() => {
    const courseRatingCount = getMaxMetricCount(aggregatedRatingsData?.metrics);
    const instructorOptions =
      instructorAggregatedRatings
        ?.filter((rating): rating is NonNullable<typeof rating> =>
          Boolean(rating?.aggregatedRatings?.metrics?.length)
        )
        .map((rating) => {
          const instructorKey = `${rating.instructor.givenName}_${rating.instructor.familyName}`;
          const displayName = `${rating.instructor.givenName} ${rating.instructor.familyName}`;
          return {
            value: instructorKey,
            label: displayName,
            count: getMaxMetricCount(rating.aggregatedRatings?.metrics),
          };
        })
        ?.slice()
        .sort((a, b) => b.count - a.count)
        .map((option) => ({
          value: option.value,
          label: option.label,
          meta: formatRatingCount(option.count),
        })) ?? [];

    return [
      {
        value: "all",
        label: "All Results",
        meta: formatRatingCount(courseRatingCount),
      },
      ...instructorOptions,
    ];
  }, [
    aggregatedRatingsData?.metrics,
    formatRatingCount,
    getMaxMetricCount,
    instructorAggregatedRatings,
  ]);

  const classReviewsSummary = useMemo(() => {
    const users = classRatingsData?.classReviews?.users;
    if (!users?.length) {
      return { count: 0, average: null as number | null };
    }

    let count = 0;
    let totalPoints = 0;
    for (const cls of users.flatMap((u) => u.classes ?? [])) {
      const metrics = cls.metrics ?? [];
      if (!metrics.some((m) => m.metricName === MetricName.Usefulness))
        continue;
      count += 1;
      for (const m of metrics) {
        if (isMetricRating(m.metricName)) {
          const value =
            m.metricName === MetricName.Difficulty ||
            m.metricName === MetricName.Workload
              ? 5 - m.value
              : m.value;
          totalPoints += value;
        }
      }
    }

    const average = count > 0 ? totalPoints / (3 * count) : null;
    return { count, average };
  }, [classRatingsData]);

  const classReviewsByUser = useMemo<ClassUserReview[]>(() => {
    const users = classRatingsData?.classReviews?.users ?? [];
    return users
      .map((user) => user.classes?.[0] ?? null)
      .filter((classReview): classReview is NonNullable<typeof classReview> =>
        Boolean(classReview)
      )
      .filter((classReview) => Boolean(classReview.reviewContent?.trim()))
      .filter((classReview) => {
        if (semesterChosen && selectedValue !== "all") {
          return (
            `${classReview.semester} ${classReview.year}` === selectedValue
          );
        }
        if (instructorChosen && sortBy) {
          return classReview.professorName === sortBy;
        }
        return true;
      })
      .sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
  }, [
    classRatingsData,
    semesterChosen,
    instructorChosen,
    selectedValue,
    sortBy,
  ]);

  if (loading && !ratingsQueryData) {
    return <EmptyState loading />;
  }

  return (
    <>
      {!hasRatings ? (
        <EmptyState
          icon={<UserStar width={32} height={32} strokeWidth={1.5} />}
          heading="No Course Ratings"
          paragraph={
            <>
              This course doesn't have any reviews yet.
              <br />
              Be the first to share your experience!
            </>
          }
        >
          <RatingButton
            user={user}
            onOpenModal={handleModalStateChange}
            userRatingData={userRatingsData}
            currentClass={currentClass}
          />
        </EmptyState>
      ) : (
        <div className={styles.root}>
          <Box className={styles.ratingsBox}>
            <Container size="3">
              <div className={styles.containerContents}>
                <div className={styles.ratingsSummary}>
                  <div className={styles.ratingsSummaryBottom}>
                    <div className={styles.ratingsSummaryBottomLeft}>
                      <p className={styles.ratingsSummaryAverage}>
                        {classReviewsSummary.average != null
                          ? classReviewsSummary.average.toFixed(1)
                          : "—"}
                      </p>
                      <RatingCountWithButton
                        count={classReviewsSummary.count}
                        addRatingButton={
                          !userRatings ? (
                            <RatingButton
                              user={user}
                              onOpenModal={handleModalStateChange}
                              userRatingData={userRatingsData}
                              currentClass={currentClass}
                            />
                          ) : undefined
                        }
                      />
                    </div>
                    <div className={styles.ratingsSummaryBottomRight}>
                      <div
                        className={styles.ratingsBody}
                        style={{
                          backgroundColor: !hasRatings
                            ? "transparent"
                            : "var(--foreground-color)",
                          boxShadow: !hasRatings
                            ? "none"
                            : "0 1px 2px rgb(0 0 0 / 5%)",
                          border: !hasRatings
                            ? "none"
                            : "1px solid var(--border-color)",
                        }}
                      >
                        {ratingsData
                          ?.filter((ratingData) =>
                            isMetricRating(ratingData.metric)
                          )
                          .sort((a, b) => {
                            const indexA = METRIC_ORDER.indexOf(a.metric);
                            const indexB = METRIC_ORDER.indexOf(b.metric);
                            return indexA - indexB;
                          })
                          .map((ratingData) => (
                            <div
                              className={styles.ratingSection}
                              key={ratingData.metric}
                            >
                              <RatingDetailView {...ratingData} />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.ratingsSummary}>
                  {/* <div className={styles.ratingsSummaryTop}> */}
                  {/* <p className={styles.ratingsSummaryHeader}>Your Rating</p> */}
                  {userRatings ? (
                    <div className={styles.ratingsSummaryHeaderRight}>
                      <Flex gap="2">
                        <Tooltip
                          trigger={
                            <Button
                              variant="secondary"
                              onClick={() => handleModalStateChange(true)}
                            >
                              Edit your rating
                              <EditPencil width={18} height={18} />
                            </Button>
                          }
                          title="Edit rating"
                        />
                        <Tooltip
                          trigger={
                            <IconButton
                              onClick={() => setIsDeleteModalOpen(true)}
                            >
                              <Trash />
                            </IconButton>
                          }
                          title="Delete rating"
                        />
                      </Flex>
                    </div>
                  ) : null}
                  {/* </div> */}
                  {userRatings ? (
                    <UserRatingSummary userRatings={userRatings} />
                  ) : (
                    <div></div>
                  )}
                </div>

                <div className={styles.ratingsSummary}>
                  <div className={styles.ratingsSummaryTop}>
                    <p className={styles.ratingsSummaryHeader}>Ratings</p>
                    <div className={styles.ratingsSummaryHeaderRight}>
                      {hasRatings ? (
                        <div className={styles.ratingsHeaderToolbar}>
                          <div className={styles.termSelectWrapper}>
                            <Select
                              variant="foreground"
                              searchable
                              searchPlaceholder={
                                activeRatingTab === RATING_TABS.Instructor
                                  ? "Search instructors"
                                  : "Search semesters"
                              }
                              emptyMessage={
                                activeRatingTab === RATING_TABS.Instructor
                                  ? "No instructors found"
                                  : "No semesters found"
                              }
                              tabs={[
                                {
                                  value: RATING_TABS.Instructor,
                                  label: "By Instructor",
                                  options: instructorSelectOptions,
                                },
                                {
                                  value: RATING_TABS.Semester,
                                  label: "By Semester",
                                  options: termSelectOptions,
                                },
                              ]}
                              contentClassName={styles.ratingsSelectContent}
                              tabsWrapperClassName={styles.ratingsSelectTabs}
                              value={selectedValue}
                              defaultTab={RATING_TABS.Instructor}
                              onTabChange={(tabValue) => {
                                setActiveRatingTab(tabValue);
                                setSelectedValue("all");
                                setSortBy(null);
                                setInstructorChosen(false);
                                setSemesterChosen(false);
                              }}
                              onChange={(newValue) => {
                                if (Array.isArray(newValue) || !newValue)
                                  return;

                                setSelectedValue(newValue);

                                if (newValue === "all") {
                                  setSortBy(null);
                                  setInstructorChosen(false);
                                  setSemesterChosen(false);
                                  return;
                                }

                                if (activeRatingTab === RATING_TABS.Semester) {
                                  setInstructorChosen(false);
                                  setSemesterChosen(true);
                                  setSortBy(newValue);
                                  return;
                                }

                                const selectedInstructorOption =
                                  instructorSelectOptions.find(
                                    (o) => o.value === newValue
                                  );
                                setInstructorChosen(true);
                                setSemesterChosen(false);
                                setSortBy(
                                  selectedInstructorOption?.label ?? newValue
                                );
                              }}
                              placeholder={
                                activeRatingTab === RATING_TABS.Instructor
                                  ? "Select instructor"
                                  : "Select term"
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {classReviewsByUser.length === 0 ? (
                    <div className={styles.noWrittenReviews}>
                      <p className={styles.noWrittenReviewsText}>
                        No written ratings yet. Be the first to share your
                        experience!
                      </p>
                    </div>
                  ) : (
                    classReviewsByUser.map((classReview, index) => (
                      <ClassRatingSummary
                        key={`${classReview.lastUpdated ?? "review"}-${index}`}
                        classReview={classReview}
                      />
                    ))
                  )}
                </div>
              </div>
            </Container>
          </Box>
        </div>
      )}

      <UserFeedbackModal
        isOpen={isModalOpen}
        onClose={() => handleModalStateChange(false)}
        title={userRatings ? "Edit Rating" : "Rate Course"}
        subtitle=""
        showSelectedCourseSubtitle={false}
        initialCourse={{
          subject: currentClass.subject,
          number: currentClass.courseNumber,
          courseId: "",
        }}
        availableTerms={availableTerms}
        onSubmit={async (
          metricValues,
          termInfo,
          courseInfo,
          reviewTitle,
          reviewContent,
          reviewerGrade
        ) => {
          await submitRatingMutation({
            metricValues,
            termInfo,
            createRatingsMutation,
            classIdentifiers: {
              subject: courseInfo.subject,
              courseNumber: courseInfo.courseNumber,
              number: courseInfo.classNumber,
            },
            refetchQueries: [],
            reviewTitle,
            reviewContent,
            reviewerGrade,
          });
          await Promise.all([
            refetchAllRatings(),
            user ? refetchUserRatings() : Promise.resolve(),
          ]);
          setIsModalOpen(false);
        }}
        initialUserClass={userRatings}
        userRatedClasses={userRatedClasses}
        disableRatedCourses={!userRatings}
        lockedCourse={{
          subject: currentClass.subject,
          number: currentClass.courseNumber,
          courseId: "",
        }}
        onSubmitPopupChange={setIsSubmitRatingPopupOpen}
        onError={(error) => {
          const message = getRatingErrorMessage(error);
          setErrorMessage(message);
          setIsErrorDialogOpen(true);
        }}
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
                deleteRatingsMutation,
                classIdentifiers: {
                  subject: currentClass.subject,
                  courseNumber: currentClass.courseNumber,
                  number: currentClass.number,
                },
                refetchQueries: [],
              });
              await Promise.all([
                refetchAllRatings(),
                user ? refetchUserRatings() : Promise.resolve(),
              ]);
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
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => setIsSubmitRatingPopupOpen(false)}
      />
    </>
  );
}

export default RatingsContainer;
