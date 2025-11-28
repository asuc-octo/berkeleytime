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

  const isFormValid = useMemo(() => {
    const isClassValid = selectedCourse !== null;
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );

    return isClassValid && isTermValid && areRatingsValid;
  }, [selectedCourse, selectedTerm, metricData]);

  // Calculate progress: 7 fields total (class selection + 6 questions)
  const progress = useMemo(() => {
    let filledFields = 0;
    const totalFields = 7;

    // Field 1: Class selection
    if (selectedCourse) filledFields++;

    // Field 2: Semester selection
    if (selectedTerm && selectedTerm.length > 0) filledFields++;

    // Field 3: Usefulness
    if (typeof metricData[MetricName.Usefulness] === "number") filledFields++;

    // Field 4: Difficulty
    if (typeof metricData[MetricName.Difficulty] === "number") filledFields++;

    // Field 5: Workload
    if (typeof metricData[MetricName.Workload] === "number") filledFields++;

    // Field 6: Attendance
    if (typeof metricData[MetricName.Attendance] === "number") filledFields++;

    // Field 7: Recording
    if (typeof metricData[MetricName.Recording] === "number") filledFields++;

    return (filledFields / totalFields) * 100;
  }, [selectedTerm, metricData, selectedCourse]);

  const reset = (
    newInitialMetricData?: MetricData,
    newInitialCourse?: CourseOption | null
  ) => {
    setMetricData(newInitialMetricData || initialMetricData);
    setSelectedTerm(null);
    setSelectedCourse(newInitialCourse ?? initialCourse ?? null);
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
