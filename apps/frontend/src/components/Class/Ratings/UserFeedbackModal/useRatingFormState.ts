import { useMemo, useState } from "react";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";

import { ICourse } from "@/lib/api";

import { MetricData } from "../metricsUtil";

interface UseRatingFormStateOptions {
  initialMetricData: MetricData;
  showCourseSelection: boolean;
}

export function useRatingFormState({
  initialMetricData,
  showCourseSelection,
}: UseRatingFormStateOptions) {
  const [metricData, setMetricData] = useState(initialMetricData);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    const isClassValid = showCourseSelection ? selectedCourse !== null : true;
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );

    return isClassValid && isTermValid && areRatingsValid;
  }, [selectedCourse, selectedTerm, metricData, showCourseSelection]);

  // Calculate progress: 6 fields total (7 with course selection)
  const progress = useMemo(() => {
    let filledFields = 0;
    const totalFields = showCourseSelection ? 7 : 6;

    // Field 1 (only in course selection mode): Class selection
    if (showCourseSelection && selectedCourse) filledFields++;

    // Field 2 (or 1): Semester selection
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

    return (filledFields / totalFields) * 100;
  }, [selectedTerm, metricData, selectedCourse, showCourseSelection]);

  const reset = (newInitialMetricData?: MetricData) => {
    setMetricData(newInitialMetricData || initialMetricData);
    setSelectedTerm(null);
    setSelectedCourse(null);
    setIsSubmitting(false);
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
  };
}
