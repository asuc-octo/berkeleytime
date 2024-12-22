import {
  METRIC_MAPPINGS,
  MetricName,
  USER_MAX_ALL_RATINGS,
} from "@repo/shared";

export type MetricData = Record<MetricName, number | undefined>;

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

export function getStatusColor(
  metricName: MetricName,
  weightedAverage: number
): string {
  // For usefulness (not inverse relationship), high numbers should be green
  // For difficulty and workload (inverse relationship), high numbers should be red
  if (weightedAverage >= 4.3) {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship
      ? "statusVeryLow"
      : "statusVeryHigh";
  } else if (weightedAverage >= 3.5) {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship
      ? "statusLow"
      : "statusHigh";
  } else if (weightedAverage >= 2.7) {
    return "statusMedium";
  } else if (weightedAverage >= 1.9) {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship
      ? "statusHigh"
      : "statusLow";
  } else {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship
      ? "statusVeryHigh"
      : "statusVeryLow";
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

export function toMetricData(
  arr: {
    metricName: MetricName;
    value: number | undefined;
  }[]
) {
  return arr.reduce((acc, v) => {
    return { ...acc, [v.metricName]: v.value };
  }, {}) as MetricData;
}

export const checkConstraint = (
  userRatingData: any,
  currentClass?: { subject: string; courseNumber: string } | null
): boolean => {
  if (!userRatingData?.userRatings?.classes) {
    return true; // If no data, user can still rate
  }
  // Filter out the current class from the count if it exists
  const otherClasses = userRatingData.userRatings.classes.filter(
    (classData: { subject: string; courseNumber: string }) => 
      !(currentClass && 
        classData.subject === currentClass.subject && 
        classData.courseNumber === currentClass.courseNumber)
  );
  return otherClasses.length <= USER_MAX_ALL_RATINGS;
};
