import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { Button } from "@repo/theme";

import { useReadTerms } from "@/hooks/api";
import { IUserRatingClass } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import { MetricData, toMetricData } from "../metricsUtil";
import { SubmitRatingPopup } from "./ConfirmationPopups";
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
    termInfo: { semester: Semester; year: number }
  ) => Promise<void>;
  initialUserClass: IUserRatingClass | null;
  onSubmitPopupChange?: (isOpen: boolean) => void;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  currentClass,
  availableTerms = [],
  onSubmit,
  initialUserClass,
  onSubmitPopupChange,
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

  const formState = useRatingFormState({
    initialMetricData,
    showCourseSelection: false,
  });

  const {
    metricData,
    setMetricData,
    selectedTerm,
    setSelectedTerm,
    isSubmitting,
    setIsSubmitting,
    progress,
  } = formState;

  const [isSubmitRatingPopupOpen, setIsSubmitRatingPopupOpen] = useState(false);
  const hasAutoSelected = useRef(false);

  const { pastTerms } = useTermFiltering({
    availableTerms,
    termsData,
  });

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
      // Reset to null when initialUserClass is null (after deletion)
      setSelectedTerm(null);
    }

    if (initialUserClass?.metrics) {
      setMetricData(toMetricData(initialUserClass.metrics));
    } else {
      // Reset to initial empty state when initialUserClass is null (after deletion)
      setMetricData(initialMetricData);
    }
  }, [
    initialUserClass,
    availableTerms,
    initialMetricData,
    setMetricData,
    setSelectedTerm,
  ]);

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
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";

    return isTermValid && areRatingsValid && hasChanges;
  }, [selectedTerm, metricData, hasChanges]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const selectedTermInfo = pastTerms.find((t) => t.value === selectedTerm);
      if (!selectedTermInfo) throw new Error("Invalid term selected");

      await onSubmit(metricData, {
        semester: selectedTermInfo.semester,
        year: selectedTermInfo.year,
      });

      onClose();
      setIsSubmitRatingPopupOpen(true);
      onSubmitPopupChange?.(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (pastTerms.length === 1 && !selectedTerm && !hasAutoSelected.current) {
      setSelectedTerm(pastTerms[0].value);
      hasAutoSelected.current = true;
    }
  }, [pastTerms, selectedTerm, setSelectedTerm]);

  const handleClose = () => {
    setMetricData(initialMetricData);
    setSelectedTerm(initialTermValue);
    hasAutoSelected.current = false; // Reset the auto-selection flag when closing
    onClose();
  };

  // Calculate modal title and subtitle
  const modalTitle = title;
  const modalSubtitle = `${currentClass.subject} ${currentClass.courseNumber}`;

  // Calculate question numbers
  const questionNumbers = useMemo(() => {
    let counter = 1;
    const semesterQuestion = counter++;
    const ratingsStart = counter;
    counter += 3; // 3 rating questions
    const attendanceStart = counter;

    return {
      classQuestionNumber: null,
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
        disabled={!isFormValid}
        type="submit"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (isFormValid) {
            handleSubmit(e);
          }
        }}
      >
        {isSubmitting
          ? "Submitting..."
          : initialUserClass
            ? "Submit Edit"
            : "Submit Rating"}
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
        progress={progress}
        footer={footer}
      >
        <div className={styles.formContentWrapper}>
          <RatingFormBody
            showCourseSelection={false}
            selectedCourse={null}
            onCourseSelect={() => {}}
            onCourseClear={() => {}}
            selectedTerm={selectedTerm}
            onTermSelect={setSelectedTerm}
            termOptions={pastTerms}
            metricData={metricData}
            setMetricData={setMetricData}
            questionNumbers={questionNumbers}
          />
        </div>
      </RatingModalLayout>
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => {
          setIsSubmitRatingPopupOpen(false);
          hasAutoSelected.current = false;
          onSubmitPopupChange?.(false);
        }}
      />
    </>
  );
}

export default UserFeedbackModal;
