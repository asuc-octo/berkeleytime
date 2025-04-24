// Add new metrics here. Supports unused metrics (it wont break the frontend)
// Backend typedef needs to be updated as well
export enum MetricName {
  Usefulness = "Usefulness",
  Difficulty = "Difficulty",
  Workload = "Workload",
  Attendance = "Attendance",
  Recording = "Recording",
  Recommended = "Recommended",
}

// Define the standard order for rating metrics
export const METRIC_ORDER = [
  MetricName.Usefulness,
  MetricName.Difficulty,
  MetricName.Workload,
];

// frontend only sends query to the backend if these metrics are populated
export const REQUIRED_METRICS = [
  MetricName.Usefulness,
  MetricName.Difficulty,
  MetricName.Workload,
];

export const METRIC_MAPPINGS = {
  [MetricName.Usefulness]: {
    tooltip:
      "This refers to how beneficial the course is for academic, professional, or personal growth.",
    getStatus: (avg: number) =>
      avg >= 4.3
        ? "Very Useful"
        : avg >= 3.5
          ? "Useful"
          : avg >= 2.7
            ? "Moderately Useful"
            : avg >= 1.9
              ? "Barely Useful"
              : "Not Useful",
    isRating: true,
    isInverseRelationship: false,
  },
  [MetricName.Difficulty]: {
    tooltip:
      "This indicates the level of challenge students face in understanding course material.",
    getStatus: (avg: number) =>
      avg >= 4.3
        ? "Very Difficult"
        : avg >= 3.5
          ? "Difficult"
          : avg >= 2.7
            ? "Moderately Difficult"
            : avg >= 1.9
              ? "Easy"
              : "Very Easy",
    isRating: true,
    isInverseRelationship: true,
  },
  [MetricName.Workload]: {
    tooltip:
      "This represents the time and effort required for course assignments and activities.",
    getStatus: (avg: number) =>
      avg >= 4.3
        ? "Very Heavy"
        : avg >= 3.5
          ? "Heavy"
          : avg >= 2.7
            ? "Moderate"
            : avg >= 1.9
              ? "Light"
              : "Very Light",
    isRating: true,
    isInverseRelationship: true,
  },
  [MetricName.Attendance]: {
    tooltip: "Indicates if attendance is required for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Required" : "Not Required"),
    isRating: false,
    isInverseRelationship: true,
  },
  [MetricName.Recording]: {
    tooltip: "Indicates if the lectures are recorded for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Recorded" : "Not Recorded"),
    isRating: false,
    isInverseRelationship: true,
  },
  [MetricName.Recommended]: {
    tooltip: "Indicates if the lectures are recommended for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Recommended" : "Not Recommended"),
    isRating: false,
    isInverseRelationship: true,
  },
};
