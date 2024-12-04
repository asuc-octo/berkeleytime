import { MetricName, METRIC_MAPPINGS } from "@repo/shared";

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

export function getStatusColor(metricName: MetricName, weightedAverage: number): string {
  if (weightedAverage >= 4) {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship ? "statusRed" : "statusGreen";
  } else if (weightedAverage >= 2) {
    return "statusOrange";
  } else {
    return METRIC_MAPPINGS[metricName]?.isInverseRelationship ? "statusGreen" : "statusRed";
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
