import { useCallback, useEffect, useMemo, useState } from "react";

import { useLazyQuery, useMutation } from "@apollo/client/react";
import { UserStar } from "iconoir-react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";

import { METRIC_ORDER } from "@repo/shared";
import { Color, Container, Select } from "@repo/theme";

import EmptyState from "@/components/Class/EmptyState";
import {
  DeleteRatingPopup,
  ErrorDialog,
} from "@/components/Class/Ratings/RatingDialog";
import UserFeedbackModal from "@/components/Class/Ratings/UserFeedbackModal";
import { useReadTerms } from "@/hooks/api";
import { useReadRatings } from "@/hooks/api/ratings/useReadRatings";
import useClass from "@/hooks/useClass";
import useUser from "@/hooks/useUser";
import { IAggregatedRatings, IMetric } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import {
  CreateRatingDocument,
  DeleteRatingDocument,
  GetAggregatedRatingsDocument,
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
  const { class: currentClass } = useClass();
  const { user } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: termsData } = useReadTerms();

  // State management
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [termRatings, setTermRatings] = useState<IAggregatedRatings | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  // Single consolidated query for all ratings data
  const {
    aggregatedRatings: aggregatedRatingsData,
    userRatings,
    userRatingsData,
    semestersWithRatings,
    courseClasses,
    hasRatings,
    loading,
    refetch: refetchAllRatings,
  } = useReadRatings({
    subject: currentClass.subject,
    courseNumber: currentClass.courseNumber,
  });

  // Simplified modal state - read URL param once on mount for initial state
  const [isModalOpen, setIsModalOpen] = useState(() => {
    return searchParams.get("feedbackModal") === "true";
  });

  // Update URL when modal opens/closes, but don't create feedback loop
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

  // Only sync from URL to state when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    const feedbackModalParam = searchParams.get("feedbackModal");
    const shouldBeOpen = feedbackModalParam === "true";

    // Only update if there's a mismatch and user is logged in
    if (shouldBeOpen !== isModalOpen && user) {
      const canRate = checkConstraint(userRatingsData);
      if (shouldBeOpen && canRate) {
        setIsModalOpen(true);
      } else if (!shouldBeOpen) {
        setIsModalOpen(false);
      }
    }
  }, [searchParams]); // Deliberately minimal dependencies

  // Create rating mutation
  const [createRatingMutation] = useMutation(CreateRatingDocument);
  const [deleteRatingMutation] = useMutation(DeleteRatingDocument);

  const [getAggregatedRatings, { data: lazyAggregatedRatingsData }] =
    useLazyQuery<IAggregatedRatings>(GetAggregatedRatingsDocument);

  useEffect(() => {
    setTermRatings(lazyAggregatedRatingsData as IAggregatedRatings | null);
  }, [lazyAggregatedRatingsData]);

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

  const ratingsData = useMemo<RatingDetailProps[] | null>(() => {
    const metricsSource =
      selectedTerm !== "all" && termRatings?.metrics
        ? termRatings.metrics
        : aggregatedRatingsData?.metrics;

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
  }, [aggregatedRatingsData, selectedTerm, termRatings]);

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

  if (loading) {
    return <EmptyState heading="Loading Ratings Data" loading />;
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
              refetchQueries: [],
            });
            // Refetch ratings data after successful submission
            refetchAllRatings();
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
                refetchQueries: [],
              });
              // Refetch ratings data after successful deletion
              refetchAllRatings();
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
