export enum MetricName {
  Usefulness = "Usefulness",
  Difficulty = "Difficulty",
  Workload = "Workload",
  Attendance = "Attendance",
  Recording = "Recording",
}

export type MetricData = Record<MetricName, number | undefined>;

const METRIC_MAPPINGS = {
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
};

export function getMetricTooltip(metricName: MetricName): string {
  return METRIC_MAPPINGS[metricName]?.tooltip ?? "";
}

export function getMetricStatus(
  metricName: MetricName,
  weightedAverage: number
): string {
  return METRIC_MAPPINGS[metricName]?.getStatus(weightedAverage) ?? "";
}

export function isMetricRating(metricName: MetricName) {
  return METRIC_MAPPINGS[metricName]?.isRating ?? false;
}

export function getStatusColor(weightedAverage: number): string {
  if (weightedAverage >= 4) {
    return "statusRed";
  } else if (weightedAverage >= 2) {
    return "statusOrange";
  } else {
    return "statusGreen";
  }
}

export function formatDate(date: Date): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Function to get ordinal suffix
  function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return "th"; // covers 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const dayWithSuffix = day + getOrdinalSuffix(day);

  return `${month} ${dayWithSuffix}, ${year}`;
}

export interface UserRating {
  lastUpdated: string;
  semester: string;
  year: number;
  metrics: [
    {
      metricName: MetricName;
      value: number;
    },
  ];
}
