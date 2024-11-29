export enum MetricName {
  Usefulness = "Usefulness",
  Difficulty = "Difficulty",
  Workload = "Workload",
  Attendance = "Attendance",
  Recording = "Recording",
  Recommended = "Recommended",
}

// typedef for backend have to be updated manually
// to modify MetricName enum, modify and compose backend typedef 

export const METRIC_MAPPINGS = {
  [MetricName.Usefulness]: {
    tooltip:
      "This refers to how beneficial the course is for academic, professional, or personal growth.",
    getStatus: (avg: number) =>
      avg >= 4 ? "Very Useful" : avg >= 2 ? "Moderately Useful" : "Not Useful",
    isRating: true,
  },
  [MetricName.Difficulty]: {
    tooltip:
      "This indicates the level of challenge students face in understanding course material.",
    getStatus: (avg: number) =>
      avg >= 4 ? "Very Difficult" : avg >= 2 ? "Moderately Difficult" : "Easy",
    isRating: true,
  },
  [MetricName.Workload]: {
    tooltip:
      "This represents the time and effort required for course assignments and activities.",
    getStatus: (avg: number) =>
      avg >= 4
        ? "Very Heavy"
        : avg >= 2
          ? "Moderate Workload"
          : "Light Workload",
    isRating: true,
  },
  [MetricName.Attendance]: {
    tooltip: "Indicates if attendance is required for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Required" : "Not Required"),
    isRating: false,
  },
  [MetricName.Recording]: {
    tooltip: "Indicates if the lectures are recorded for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Recorded" : "Not Recorded"),
    isRating: false,
  },
  [MetricName.Recommended]: {
    tooltip: "Indicates if the lectures are recommended for the course.",
    getStatus: (avg: number) => (avg > 0 ? "Recommended" : "Not Recommended"),
    isRating: false,
  },
};
