import { useMemo, useState } from "react";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";

import { CourseOption } from "@/components/CourseSelect";

import { MetricData } from "../metricsUtil";

interface UseRatingFormStateOptions {
  initialMetricData: MetricData;
  initialCourse?: CourseOption | null;
}

export function useRatingFormState({
  initialMetricData,
  initialCourse = null,
}: UseRatingFormStateOptions) {
  const [metricData, setMetricData] = useState(initialMetricData);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    initialCourse
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewContent, setReviewContent] = useState<string>("");
  const [reviewerGrade, setReviewerGrade] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    const isClassValid = selectedCourse !== null;
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );

    return isClassValid && isTermValid && areRatingsValid;
  }, [selectedCourse, selectedTerm, metricData]);

  // Calculate progress: 8 fields (semester + 3 ratings + 2 attendance + title + review)
  const progress = useMemo(() => {
    let filledFields = 0;
    const totalFields = 8;

    // Field 1: Semester selection
    if (selectedTerm && selectedTerm.length > 0) filledFields++;

    // Field 2: Usefulness
    if (typeof metricData[MetricName.Usefulness] === "number") filledFields++;

    // Field 3: Difficulty
    if (typeof metricData[MetricName.Difficulty] === "number") filledFields++;

    // Field 4: Workload
    if (typeof metricData[MetricName.Workload] === "number") filledFields++;

    // Field 5: Attendance
    if (typeof metricData[MetricName.Attendance] === "number") filledFields++;

    // Field 6: Recording
    if (typeof metricData[MetricName.Recording] === "number") filledFields++;

    // Field 7: Review title
    if (reviewTitle.trim().length > 0) filledFields++;

    // Field 8: Review content
    if (reviewContent.trim().length > 0) filledFields++;

    return (filledFields / totalFields) * 100;
  }, [selectedTerm, metricData, reviewTitle, reviewContent]);

  const reset = (
    newInitialMetricData?: MetricData,
    newInitialCourse?: CourseOption | null
  ) => {
    setMetricData(newInitialMetricData || initialMetricData);
    setSelectedTerm(null);
    setSelectedCourse(newInitialCourse ?? initialCourse ?? null);
    setIsSubmitting(false);
    setReviewTitle("");
    setReviewContent("");
    setReviewerGrade(null);
  };

  return {
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
    reviewTitle,
    setReviewTitle,
    reviewContent,
    setReviewContent,
    reviewerGrade,
    setReviewerGrade,
  };
}
