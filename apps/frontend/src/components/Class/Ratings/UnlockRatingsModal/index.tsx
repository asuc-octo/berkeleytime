import { FormEvent, useEffect, useMemo, useState } from "react";

import { MetricName } from "@repo/shared";
import { Button } from "@repo/theme";

import { useReadCourseWithInstructor } from "@/hooks/api";
import { ICourse } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import { SubmitRatingPopup } from "../UserFeedbackModal/ConfirmationPopups";
import { RatingFormBody } from "../UserFeedbackModal/RatingFormBody";
import { RatingModalLayout } from "../UserFeedbackModal/RatingModalLayout";
import { useRatingFormState } from "../UserFeedbackModal/useRatingFormState";
import { useTermFiltering } from "../UserFeedbackModal/useTermFiltering";
import { MetricData, toMetricData } from "../metricsUtil";
import styles from "./UnlockRatingsModal.module.scss";

// Number of ratings required to unlock ratings view
const DEFAULT_REQUIRED_RATINGS_COUNT = 3;

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
}

interface UnlockRatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    metricData: MetricData,
    termInfo: { semester: Semester; year: number },
    classInfo: { subject: string; courseNumber: string; number: string }
  ) => Promise<void>;
  userRatedClasses?: Array<{ subject: string; courseNumber: string }>;
  requiredRatingsCount?: number;
  onSubmitPopupChange?: (isOpen: boolean) => void;
}

export function UnlockRatingsModal({
  isOpen,
  onClose,
  onSubmit,
  userRatedClasses = [],
  requiredRatingsCount = DEFAULT_REQUIRED_RATINGS_COUNT,
  onSubmitPopupChange,
}: UnlockRatingsModalProps) {
  const initialMetricData = useMemo(
    () =>
      toMetricData(
        Object.values(MetricName).map((metric) => {
          return { metricName: metric, value: undefined };
        })
      ),
    []
  );

  const formState = useRatingFormState({
    initialMetricData,
    showCourseSelection: true,
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
    isFormValid,
    progress,
    reset,
  } = formState;

  const [currentRatingIndex, setCurrentRatingIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [isSubmitRatingPopupOpen, setIsSubmitRatingPopupOpen] = useState(false);

  const shouldFetchCourseData = !!selectedCourse;
  const { data: courseData } = useReadCourseWithInstructor(
    selectedCourse?.subject ?? "",
    selectedCourse?.number ?? "",
    {
      skip: !shouldFetchCourseData,
    }
  );

  const { filteredSemesters } = useTermFiltering({
    availableTerms: [],
    selectedCourse,
    courseData,
  });

  // Calculate progress across all n ratings
  const overallProgress = useMemo(() => {
    const currentFormProgress = progress / 100;
    return (
      ((currentRatingIndex + currentFormProgress) / requiredRatingsCount) * 100
    );
  }, [progress, currentRatingIndex, requiredRatingsCount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const selectedTermInfo = filteredSemesters.find(
        (t) => t.value === selectedTerm
      );
      if (!selectedTermInfo) throw new Error("Invalid term selected");

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

      // Check if this is the last rating
      const isLastRating = currentRatingIndex >= requiredRatingsCount - 1;

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

      if (!isLastRating) {
        // Trigger slide-out animation
        setIsAnimating(true);
        setAnimationClass(styles.slideOutLeft);

        // Wait for slide-out animation to complete, then update state and slide in
        setTimeout(() => {
          setCurrentRatingIndex(currentRatingIndex + 1);
          reset();
          setAnimationClass(styles.slideInRight);

          // Remove animation class after slide-in completes
          setTimeout(() => {
            setIsAnimating(false);
            setAnimationClass("");
          }, 300);
        }, 300);
      } else {
        setCurrentRatingIndex(0);
        reset();

        onClose();
        setIsSubmitRatingPopupOpen(true);
        onSubmitPopupChange?.(true);
      }
    } catch (error) {
      console.error("Error submitting ratings:", error);
      setIsSubmitting(false);
    } finally {
      if (currentRatingIndex >= requiredRatingsCount - 1) {
        setIsSubmitting(false);
      }
    }
  };

  // Reset scroll position when moving to next rating
  useEffect(() => {
    if (isOpen) {
      const modalBody = document.querySelector(`.${styles.modalBody}`);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    }
  }, [currentRatingIndex, isOpen]);

  // Reset course selection when it changes
  useEffect(() => {
    if (selectedCourse) {
      setSelectedTerm(null);
    }
  }, [selectedCourse, setSelectedTerm]);

  const handleClose = () => {
    reset();
    setCurrentRatingIndex(0);
    onClose();
  };

  // Calculate modal title and subtitle
  const modalTitle = "Unlock Ratings Information";
  const ratingsLeft = requiredRatingsCount - currentRatingIndex;
  const modalSubtitle = `You have ${ratingsLeft} rating${ratingsLeft !== 1 ? "s" : ""} left to view the ratings. It only takes a minute!`;

  // Calculate question numbers
  const questionNumbers = useMemo(() => {
    let counter = 1;
    const classQuestion = counter++;
    const semesterQuestion = counter++;
    const ratingsStart = counter;
    counter += 3; // 3 rating questions
    const attendanceStart = counter;

    return {
      classQuestionNumber: classQuestion,
      semesterQuestionNumber: semesterQuestion,
      ratingsStartNumber: ratingsStart,
      attendanceStartNumber: attendanceStart,
    };
  }, []);

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        disabled={!isFormValid || isAnimating}
        type="submit"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (isFormValid && !isAnimating) {
            handleSubmit(e);
          }
        }}
      >
        {isSubmitting
          ? "Submitting..."
          : currentRatingIndex < requiredRatingsCount - 1
            ? `Submit & Continue (${requiredRatingsCount - currentRatingIndex - 1} left)`
            : "Submit"}
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
        modalBodyClassName={styles.modalBody}
      >
        <div className={`${styles.formContentWrapper} ${animationClass}`}>
          <RatingFormBody
            showCourseSelection={true}
            selectedCourse={selectedCourse}
            onCourseSelect={setSelectedCourse}
            onCourseClear={() => {
              setSelectedCourse(null);
              setSelectedTerm(null);
            }}
            selectedTerm={selectedTerm}
            onTermSelect={setSelectedTerm}
            termOptions={filteredSemesters}
            metricData={metricData}
            setMetricData={setMetricData}
            userRatedClasses={userRatedClasses}
            questionNumbers={questionNumbers}
          />
        </div>
      </RatingModalLayout>
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => {
          setIsSubmitRatingPopupOpen(false);
          onSubmitPopupChange?.(false);
        }}
      />
    </>
  );
}

export default UnlockRatingsModal;
