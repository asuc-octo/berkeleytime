import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { Button } from "@repo/theme";

import { CourseOption } from "@/components/CourseSelect";
import { useReadCourseWithInstructor, useReadTerms } from "@/hooks/api";
import { IUserRatingClass } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import { MetricData, toMetricData } from "../metricsUtil";
import { RatingFormBody } from "./RatingFormBody";
import { RatingModalLayout } from "./RatingModalLayout";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./UserFeedbackModal.module.scss";
import { useRatingFormState } from "./useRatingFormState";
import { useTermFiltering } from "./useTermFiltering";

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
  classNumber?: string;
}

function normalizeStoredReviewerGrade(
  grade: string | null | undefined
): string | null {
  if (!grade || grade.toLowerCase() === "n/a") return null;
  return grade;
}

function reviewerGradeFromUserClass(
  userClass: IUserRatingClass | null | undefined
): string | null | undefined {
  return (userClass as { reviewerGrade?: string | null } | undefined)
    ?.reviewerGrade;
}

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  showSelectedCourseSubtitle?: boolean;
  availableTerms?: Term[];
  requiredRatingsCount?: number;
  initialCourse?: CourseOption | null;
  onSubmit: (
    metricData: MetricData,
    termInfo: { semester: Semester; year: number },
    courseInfo: { subject: string; courseNumber: string; classNumber: string },
    reviewTitle?: string,
    reviewContent?: string,
    reviewerGrade?: string
  ) => Promise<void>;
  initialUserClass?: IUserRatingClass | null;
  userRatedClasses?: Array<{ subject: string; courseNumber: string }>;
  onSubmitPopupChange?: (isOpen: boolean) => void;
  disableRatedCourses?: boolean;
  lockedCourse?: CourseOption | null;
  onError?: (error: unknown) => void;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  subtitle,
  showSelectedCourseSubtitle = true,
  availableTerms = [],
  requiredRatingsCount = 1,
  initialCourse = null,
  onSubmit,
  initialUserClass = null,

  onSubmitPopupChange,

  onError,
}: UserFeedbackModalProps) {
  const { data: termsData, loading: termsLoading } = useReadTerms();
  const totalRatings = Math.max(1, requiredRatingsCount);
  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const prevRatingIndexRef = useRef<number>(0);

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

  const initialSelectedCourse = useMemo<CourseOption | null>(() => {
    const base =
      initialUserClass &&
      initialUserClass.subject &&
      initialUserClass.courseNumber
        ? {
            subject: initialUserClass.subject,
            number: initialUserClass.courseNumber,
            courseId: "",
          }
        : initialCourse;
    if (!base) return null;
    return {
      subject: base.subject,
      number: base.number,
      courseId: base.courseId ?? "",
    };
  }, [initialCourse, initialUserClass]);

  const formState = useRatingFormState({
    initialMetricData,
    initialCourse: initialSelectedCourse,
  });

  const {
    metricData,
    setMetricData,
    selectedTerm,
    setSelectedTerm,
    selectedCourse,
    setSelectedCourse,
    isSubmitting,
    setIsSubmitting,
    progress,
    reset,
    reviewTitle,
    setReviewTitle,
    reviewContent,
    setReviewContent,
    reviewerGrade,
    setReviewerGrade,
  } = formState;

  const overallProgress = useMemo(
    () => ((currentRatingIndex + progress / 100) / totalRatings) * 100,
    [currentRatingIndex, progress, totalRatings]
  );
  const { data: courseData, loading: courseLoading } =
    useReadCourseWithInstructor(
      selectedCourse?.subject ?? "",
      selectedCourse?.number ?? "",
      {
        skip: !selectedCourse,
      }
    );

  const { filteredSemesters, hasAutoSelected } = useTermFiltering({
    availableTerms,
    termsData: termsData,
    selectedCourse,
    courseData: courseData ?? undefined,
  });

  const termOptions = filteredSemesters;

  // Show loading when:
  // 1. Terms data is loading, OR
  // 2. A course is selected AND (course data is loading OR we don't have course data yet)
  const isTermOptionsLoading =
    termsLoading || (!!selectedCourse && (courseLoading || !courseData));

  const hasHydratedRef = useRef(false);
  const lastInitialKeyRef = useRef<string | null>(null);

  const termOptionsKey = useMemo(
    () => termOptions.map((t) => t.value).join("|"),
    [termOptions]
  );

  useEffect(() => {
    const targetTermOptions = termOptions.length ? termOptions : availableTerms;
    const initialCourseKeyValue = initialSelectedCourse
      ? `${initialSelectedCourse.subject}-${initialSelectedCourse.number}`
      : "no-course";
    const initialKey = initialUserClass
      ? `${initialUserClass.subject}-${initialUserClass.courseNumber}-${initialUserClass.semester}-${initialUserClass.year}-${initialCourseKeyValue}`
      : `none-${initialCourseKeyValue}`;

    if (hasHydratedRef.current && lastInitialKeyRef.current === initialKey) {
      return;
    }

    lastInitialKeyRef.current = initialKey;
    hasHydratedRef.current = true;

    if (initialUserClass?.semester && initialUserClass?.year) {
      // Match by semester and year only, find the first matching option
      const matchingTerm = targetTermOptions.find(
        (term) =>
          term.semester === initialUserClass.semester &&
          term.year === initialUserClass.year
      );
      if (matchingTerm) {
        setSelectedTerm(matchingTerm.value);
      } else {
        setSelectedTerm(null);
      }
    } else {
      // Reset to null when initialUserClass is null (after deletion)
      setSelectedTerm(null);
    }

    if (initialUserClass?.metrics) {
      setMetricData(toMetricData(initialUserClass.metrics));
    } else {
      // Reset to initial empty state when initialUserClass is null (after deletion)
      setMetricData(initialMetricData);
    }
    if (initialUserClass) {
      setReviewTitle(initialUserClass.reviewTitle ?? "");
      setReviewContent(initialUserClass.reviewContent ?? "");
    } else {
      setReviewTitle("");
      setReviewContent("");
    }
    setReviewerGrade(
      normalizeStoredReviewerGrade(reviewerGradeFromUserClass(initialUserClass))
    );
    setSelectedCourse(initialSelectedCourse);
    setCurrentRatingIndex(0);
  }, [
    initialUserClass,
    availableTerms,
    termOptionsKey,
    initialMetricData,
    setMetricData,
    setSelectedTerm,
    setSelectedCourse,
    initialSelectedCourse,
    setReviewerGrade,
    setReviewTitle,
    setReviewContent,
  ]);

  const initialCourseKey = initialSelectedCourse
    ? `${initialSelectedCourse.subject}-${initialSelectedCourse.number}`
    : "";
  const currentCourseKey = selectedCourse
    ? `${selectedCourse.subject}-${selectedCourse.number}`
    : "";

  const hasChanges = useMemo(() => {
    const termChanged = selectedTerm !== initialTermValue;
    const metricsChanged = Object.values(MetricName).some(
      (metric) => metricData[metric] !== initialMetricData[metric]
    );
    const courseChanged = currentCourseKey !== initialCourseKey;

    const initialTitle = (initialUserClass?.reviewTitle ?? "").trim();
    const initialContent = (initialUserClass?.reviewContent ?? "").trim();
    const initialGrade = normalizeStoredReviewerGrade(
      reviewerGradeFromUserClass(initialUserClass)
    );
    const reviewChanged =
      reviewTitle.trim() !== initialTitle ||
      reviewContent.trim() !== initialContent ||
      (reviewerGrade ?? null) !== (initialGrade ?? null);

    // Check if all required metrics are filled out
    const allRequiredMetricsFilled = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );
    return (
      allRequiredMetricsFilled &&
      (termChanged || metricsChanged || courseChanged || reviewChanged)
    );
  }, [
    selectedTerm,
    metricData,
    initialTermValue,
    initialMetricData,
    currentCourseKey,
    initialCourseKey,
    initialUserClass,
    reviewTitle,
    reviewContent,
    reviewerGrade,
  ]);

  const isFormValid = useMemo(() => {
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const isCourseValid = !!selectedCourse;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";

    const trimmedTitle = reviewTitle.trim();
    const trimmedContent = reviewContent.trim();
    const isReviewPairValid =
      (trimmedTitle.length === 0 && trimmedContent.length === 0) ||
      (trimmedTitle.length > 0 && trimmedContent.length > 0);

    return (
      isCourseValid &&
      isTermValid &&
      areRatingsValid &&
      hasChanges &&
      isReviewPairValid
    );
  }, [
    selectedTerm,
    metricData,
    hasChanges,
    selectedCourse,
    reviewTitle,
    reviewContent,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const selectedTermInfo = termOptions.find(
        (t) => t.value === selectedTerm
      );
      if (!selectedTermInfo) throw new Error("Invalid term selected");

      const termParts = selectedTerm?.trim().split(" ") || [];
      const parsedClassNumber = termParts[termParts.length - 1] || "";
      const classNumber = selectedTermInfo.classNumber ?? parsedClassNumber;
      if (!classNumber) {
        throw new Error(
          "Invalid term selection - class number could not be determined."
        );
      }

      if (!selectedCourse) {
        throw new Error("A course must be selected.");
      }

      await onSubmit(
        metricData,
        {
          semester: selectedTermInfo.semester,
          year: selectedTermInfo.year,
        },
        {
          subject: selectedCourse.subject,
          courseNumber: selectedCourse.number,
          classNumber,
        },
        reviewTitle || undefined,
        reviewContent || undefined,
        reviewerGrade ?? undefined
      );

      const isLastRating = currentRatingIndex >= totalRatings - 1;
      if (!isLastRating) {
        setCurrentRatingIndex((idx) => idx + 1);
        reset(initialMetricData, null);
        setSelectedTerm(null);
        setSelectedCourse(null);
        return;
      }

      setCurrentRatingIndex(0);
      handleClose();
      onSubmitPopupChange?.(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (termOptions.length === 1 && !selectedTerm && !hasAutoSelected.current) {
      setSelectedTerm(termOptions[0].value);
      hasAutoSelected.current = true;
    }
  }, [termOptions, selectedTerm, setSelectedTerm, hasAutoSelected]);

  const handleClose = () => {
    reset(initialMetricData, initialSelectedCourse);
    setSelectedTerm(initialTermValue);
    setCurrentRatingIndex(0);
    prevRatingIndexRef.current = 0;
    hasAutoSelected.current = false;
    hasHydratedRef.current = false; // Allow re-hydration from initialUserClass on next open
    onClose();
  };

  // Calculate modal title and subtitle
  const modalTitle = title;
  const modalSubtitle =
    subtitle !== undefined
      ? subtitle
      : showSelectedCourseSubtitle && selectedCourse
        ? `${selectedCourse.subject} ${selectedCourse.number}`
        : "";

  // Calculate question numbers
  const questionNumbers = useMemo(() => {
    let counter = 1;
    const semesterQuestion = counter++;
    const ratingsStart = counter;
    counter += 3; // 3 rating questions
    const attendanceStart = counter;

    return {
      semesterQuestionNumber: semesterQuestion,
      ratingsStartNumber: ratingsStart,
      attendanceStartNumber: attendanceStart,
    };
  }, []);

  // Scroll to top when moving to next rating
  useEffect(() => {
    const prevIndex = prevRatingIndexRef.current;

    // Only scroll if rating index increased (Submit & Continue was clicked)
    if (currentRatingIndex > prevIndex && prevIndex >= 0) {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    }

    prevRatingIndexRef.current = currentRatingIndex;
  }, [currentRatingIndex]);

  const remainingRatings = Math.max(0, totalRatings - currentRatingIndex - 1);
  const submitLabel = isSubmitting
    ? "Submitting..."
    : totalRatings > 1
      ? remainingRatings > 0
        ? `Submit & Continue (${remainingRatings} left)`
        : "Submit"
      : initialUserClass
        ? "Submit Edit"
        : "Submit Rating";

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        disabled={!isFormValid}
        type="submit"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (isFormValid) {
            handleSubmit(e);
          }
        }}
      >
        {submitLabel}
      </Button>
    </>
  );

  return (
    <>
      <RatingModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        subtitle={modalSubtitle}
        progress={overallProgress}
        footer={footer}
        modalBodyRef={modalBodyRef}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentRatingIndex}
            className={styles.formContentWrapper}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <RatingFormBody
              selectedCourse={selectedCourse}
              selectedTerm={selectedTerm}
              onTermSelect={setSelectedTerm}
              termOptions={termOptions}
              termOptionsLoading={isTermOptionsLoading}
              metricData={metricData}
              setMetricData={setMetricData}
              questionNumbers={questionNumbers}
              reviewTitle={reviewTitle}
              setReviewTitle={setReviewTitle}
              reviewContent={reviewContent}
              setReviewContent={setReviewContent}
              reviewerGrade={reviewerGrade}
              onReviewerGradeChange={setReviewerGrade}
            />
          </motion.div>
        </AnimatePresence>
      </RatingModalLayout>
    </>
  );
}

export default UserFeedbackModal;
