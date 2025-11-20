import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Progress } from "radix-ui";
import _ from "lodash";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { Button, Dialog, Flex, Select } from "@repo/theme";

import CourseSearch from "@/components/CourseSearch";
import { useReadCourseWithInstructor, useReadTerms } from "@/hooks/api";
import { ICourse, IUserRatingClass } from "@/lib/api";
import { Semester, TemporalPosition } from "@/lib/generated/graphql";
import { sortByTermDescending } from "@/lib/classes";

import {
  MetricData,
  formatInstructorText,
  toMetricData,
} from "../metricsUtil";
import { SubmitRatingPopup } from "./ConfirmationPopups";
import { AttendanceForm, RatingsForm } from "./FeedbackForm";
import styles from "./UserFeedbackModal.module.scss";

// Feature flag for user feedback modal changes
const TEST = true;

// Number of ratings required to unlock ratings view (TEST mode only)
const REQUIRED_RATINGS_COUNT = 3;

const RequiredAsterisk = () => <span style={{ color: "red" }}>*</span>;

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
}

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentClass: {
    subject: string;
    courseNumber: string;
    number: string;
    semester: string;
    year: number;
  };
  availableTerms: Term[];
  onSubmit: (
    metricData: MetricData,
    termInfo: { semester: Semester; year: number },
    classInfo?: { subject: string; courseNumber: string; number: string }
  ) => Promise<void>;
  initialUserClass: IUserRatingClass | null;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  currentClass,
  availableTerms = [],
  onSubmit,
  initialUserClass,
}: UserFeedbackModalProps) {
  const { data: termsData } = useReadTerms();
  const initialMetricData = useMemo(
    () =>
      toMetricData(
        initialUserClass?.metrics ??
          Object.values(MetricName).map((metric) => {
            return { metricName: metric, value: undefined };
          })
      ),
    [initialUserClass?.metrics]
  );

  const initialTermValue = useMemo(() => {
    if (initialUserClass?.semester && initialUserClass?.year) {
      // Match by semester and year only, find the first matching option
      const matchingTerm = availableTerms.find(
        (term) =>
          term.semester === initialUserClass.semester &&
          term.year === initialUserClass.year
      );
      return matchingTerm ? matchingTerm.value : null;
    }
    return null;
  }, [initialUserClass?.semester, initialUserClass?.year, availableTerms]);

  const [selectedTerm, setSelectedTerm] = useState<string | null>(
    initialTermValue
  );
  const [metricData, setMetricData] = useState(initialMetricData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoSelected = useRef(false);

  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);

  const shouldFetchCourseData = TEST && !!selectedCourse;
  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    {
      skip: !shouldFetchCourseData,
    }
  );

  useEffect(() => {
    if (initialUserClass?.semester && initialUserClass?.year) {
      // Match by semester and year only, find the first matching option
      const matchingTerm = availableTerms.find(
        (term) =>
          term.semester === initialUserClass.semester &&
          term.year === initialUserClass.year
      );
      if (matchingTerm) {
        setSelectedTerm(matchingTerm.value);
      }
    } else {
      setSelectedTerm(null);
    }
    if (initialUserClass?.metrics) {
      setMetricData(toMetricData(initialUserClass.metrics));
    } else {
      setMetricData(initialMetricData);
    }
  }, [initialUserClass, availableTerms, initialMetricData]);

  const hasChanges = useMemo(() => {
    const termChanged = selectedTerm !== initialTermValue;
    const metricsChanged = Object.values(MetricName).some(
      (metric) => metricData[metric] !== initialMetricData[metric]
    );
    // Check if all required metrics are filled out
    const allRequiredMetricsFilled = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );
    return allRequiredMetricsFilled && (termChanged || metricsChanged);
  }, [selectedTerm, metricData, initialTermValue, initialMetricData]);

  const isFormValid = useMemo(() => {
    const isClassValid = TEST ? selectedCourse !== null : true;
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";

    // In TEST mode, we don't need to check hasChanges since we're collecting new ratings
    if (TEST) {
      return isClassValid && isTermValid && areRatingsValid;
    }

    return isTermValid && areRatingsValid && hasChanges;
  }, [selectedCourse, selectedTerm, metricData, hasChanges]);

  // Calculate progress: 6 fields total (7 in TEST mode), each field contributes proportionally
  const progress = useMemo(() => {
    let filledFields = 0;
    const totalFields = TEST ? 7 : 6;

    // Field 1 (TEST mode only): Class selection
    if (TEST && selectedCourse) filledFields++;

    // Field 2 (or 1 in non-TEST): Semester selection
    if (selectedTerm && selectedTerm.length > 0) filledFields++;

    // Field 3 (or 2): Usefulness
    if (typeof metricData[MetricName.Usefulness] === "number") filledFields++;

    // Field 4 (or 3): Difficulty
    if (typeof metricData[MetricName.Difficulty] === "number") filledFields++;

    // Field 5 (or 4): Workload
    if (typeof metricData[MetricName.Workload] === "number") filledFields++;

    // Field 6 (or 5): Attendance
    if (typeof metricData[MetricName.Attendance] === "number") filledFields++;

    // Field 7 (or 6): Recording
    if (typeof metricData[MetricName.Recording] === "number") filledFields++;

    // In TEST mode, calculate progress across all n ratings
    if (TEST) {
      const currentFormProgress = (filledFields / totalFields);
      const overallProgress = ((currentRatingIndex + currentFormProgress) / REQUIRED_RATINGS_COUNT) * 100;
      return overallProgress;
    }

    return (filledFields / totalFields) * 100;
  }, [selectedTerm, metricData, selectedCourse, currentRatingIndex]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      // In TEST mode, use filteredSemesters; otherwise use availableTerms
      const termsToSearch = TEST ? filteredSemesters : availableTerms;
      const selectedTermInfo = termsToSearch.find(
        (t) => t.value === selectedTerm
      );
      if (!selectedTermInfo) throw new Error("Invalid term selected");

      if (TEST) {
        if (!selectedCourse) {
          throw new Error("A course must be selected.");
        }

        // Extract class number from selectedTerm value (format: "Semester Year Number")
        const termParts = selectedTerm?.split(" ") || [];
        const classNumber = termParts[termParts.length - 1] || "";

        // Find the matching class from courseData
        const matchingClass = courseData?.classes?.find(
          (c) =>
            c.semester === selectedTermInfo.semester &&
            c.year === selectedTermInfo.year &&
            c.number === classNumber
        );

        if (!matchingClass) {
          throw new Error("Could not find matching class for selected term");
        }

        // Submit the rating immediately with the selected course's class information
        await onSubmit(
          metricData,
          {
            semester: selectedTermInfo.semester,
            year: selectedTermInfo.year,
          },
          {
            subject: selectedCourse.subject,
            courseNumber: selectedCourse.number,
            number: classNumber,
          }
        );

        // Check if this is the last rating
        if (currentRatingIndex < REQUIRED_RATINGS_COUNT - 1) {
          setCurrentRatingIndex(currentRatingIndex + 1);
          setSelectedCourse(null);
          setSelectedTerm(null);
          setMetricData(initialMetricData);
          setIsSubmitting(false);
        } else {
          setCurrentRatingIndex(0);
          setSelectedCourse(null);
          setSelectedTerm(null);
          setMetricData(initialMetricData);

          onClose();
          setIsSubmitRatingPopupOpen(true);
        }
      } else {
        // Original single-rating flow
        await onSubmit(metricData, {
          semester: selectedTermInfo.semester,
          year: selectedTermInfo.year,
        });

        onClose();
        setIsSubmitRatingPopupOpen(true);
      }
    } catch (error) {
      console.error("Error submitting ratings:", error);
      setIsSubmitting(false);
    } finally {
      if (!TEST || currentRatingIndex >= REQUIRED_RATINGS_COUNT - 1) {
        setIsSubmitting(false);
      }
    }
  };
  const [isSubmitRatingPopupOpen, setIsSubmitRatingPopupOpen] = useState(false);

  // Filter for past terms
  const pastTerms = useMemo(() => {
    if (!termsData) return availableTerms;

    const termPositions = termsData.reduce(
      (acc: Record<string, TemporalPosition>, term: any) => {
        acc[`${term.semester} ${term.year}`] = term.temporalPosition;
        return acc;
      },
      {}
    );
    return availableTerms.filter((term) => {
      const position = termPositions[term.value];
      return (
        position === TemporalPosition.Past ||
        TemporalPosition.Current ||
        !position
      );
    });
  }, [availableTerms, termsData]);

  const filteredSemesters = useMemo(() => {
    if (!TEST || !selectedCourse || !courseData) return pastTerms;

    const courseTerms: Term[] = (courseData.classes ?? [])
      .toSorted(sortByTermDescending)
      .filter((c) => c.anyPrintInScheduleOfClasses !== false)
      .filter((c) => {
        if (c.primarySection?.startDate) {
          const startDate = new Date(c.primarySection.startDate);
          const today = new Date();
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

    const uniqueTerms = _.uniqBy(courseTerms, (term) => term.label);

    return uniqueTerms.length > 0 ? uniqueTerms : pastTerms;
  }, [TEST, selectedCourse, courseData, pastTerms]);

  useEffect(() => {
    // Don't auto-select in TEST mode since semester selection depends on choosing a class first
    if (TEST) return;
    
    if (
      filteredSemesters.length === 1 &&
      !selectedTerm &&
      !hasAutoSelected.current
    ) {
      setSelectedTerm(filteredSemesters[0].value);
      hasAutoSelected.current = true;
    }
  }, [filteredSemesters, selectedTerm, TEST]);

  useEffect(() => {
    if (!TEST) return;
    hasAutoSelected.current = false;
    if (selectedCourse) {
      setSelectedTerm(null);
    }
  }, [selectedCourse]);

  const handleClose = () => {
    setMetricData(initialMetricData);
    setSelectedTerm(initialTermValue);
    hasAutoSelected.current = false;

    if (TEST) {
      setSelectedCourse(null);
      setCurrentRatingIndex(0);
    }

    onClose();
  };

  // Calculate modal title and subtitle
  const modalTitle = TEST ? "Unlock Ratings Information" : title;
  const ratingsLeft = REQUIRED_RATINGS_COUNT - currentRatingIndex;
  const modalSubtitle = TEST
    ? `You have ${ratingsLeft} rating${ratingsLeft !== 1 ? "s" : ""} left to view the ratings. It only takes a minute!`
    : `${currentClass.subject} ${currentClass.courseNumber}`;

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Card style={{ width: "auto" }}>
            <div className={styles.modalHeaderWrapper}>
              <Dialog.Header
                title={modalTitle}
                subtitle={modalSubtitle}
                hasCloseButton
                className={styles.modalHeader}
              />
              <Progress.Root
                className={styles.progressBar}
                value={progress}
                max={100}
              >
                <Progress.Indicator
                  className={styles.progressIndicator}
                  style={{ transform: `translateX(-${100 - progress}%)` }}
                />
              </Progress.Root>
            </div>
            <Dialog.Body className={styles.modalBody}>
              <Flex direction="column">
                {TEST && (
                  <div className={styles.formGroup}>
                    <div className={styles.questionPair}>
                      <h3>
                        1. Which class are you rating?{" "}
                        <RequiredAsterisk />
                      </h3>
                      <div
                        style={{
                          width: 350,
                          margin: "0 auto",
                        }}
                      >
                        <CourseSearch
                          selectedCourse={selectedCourse}
                          onSelect={(course) => {
                            setSelectedCourse(course as ICourse);
                          }}
                          onClear={() => {
                            setSelectedCourse(null);
                            setSelectedTerm(null);
                          }}
                          minimal={true}
                          inputStyle={{
                            height: 44,
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <div className={styles.questionPair}>
                    <h3>
                      {TEST ? "2" : "1"}. What semester did you take this course?{" "}
                      <RequiredAsterisk />
                    </h3>
                    <div
                      style={{
                        width: 350,
                        margin: "0 auto",
                      }}
                    >
                      <Select
                        options={filteredSemesters.map((term) => ({
                          value: term.value,
                          label: term.label,
                        }))}
                        disabled={TEST && !selectedCourse}
                        value={selectedTerm}
                        onChange={(selectedOption) => {
                          if (Array.isArray(selectedOption))
                            setSelectedTerm(null);
                          else setSelectedTerm(selectedOption || null);
                        }}
                        placeholder="Select semester"
                        clearable={true}
                      />
                    </div>
                  </div>
                </div>

                <RatingsForm
                  metricData={metricData}
                  setMetricData={setMetricData}
                />
                <AttendanceForm
                  metricData={metricData}
                  setMetricData={setMetricData}
                />
              </Flex>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button
                  className={styles.cancelButton}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                disabled={!isFormValid}
                type="submit"
                onClick={(e: any) => {
                  e.preventDefault();
                  if (isFormValid) {
                    handleSubmit(e);
                  }
                }}
              >
                {isSubmitting
                  ? "Submitting..."
                  : TEST
                    ? currentRatingIndex < REQUIRED_RATINGS_COUNT - 1
                      ? `Submit & Continue (${REQUIRED_RATINGS_COUNT - currentRatingIndex - 1} left)`
                      : "Submit"
                    : initialUserClass
                      ? "Submit Edit"
                      : "Submit Rating"}
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Portal>
      </Dialog.Root>
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => {
          setIsSubmitRatingPopupOpen(false);
          hasAutoSelected.current = false;
        }}
      />
    </>
  );
}

export default UserFeedbackModal;
