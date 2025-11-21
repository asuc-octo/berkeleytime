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

const COLOR_THRESHOLDS = [
  { min: 4.3, inverse: "red", normal: "green" },
  { min: 3.5, inverse: "orange", normal: "lime" },
  { min: 2.7, inverse: "yellow", normal: "yellow" },
  { min: 1.9, inverse: "lime", normal: "orange" },
  { min: 0, inverse: "green", normal: "red" },
];

export function getStatusColor(
  metricName: MetricName,
  weightedAverage: number
): string {
  const isInverse = METRIC_MAPPINGS[metricName]?.isInverseRelationship;
  const threshold =
    COLOR_THRESHOLDS.find((t) => weightedAverage >= t.min) ??
    COLOR_THRESHOLDS[COLOR_THRESHOLDS.length - 1];
  return isInverse ? threshold.inverse : threshold.normal;
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
  classNumber: string;
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
      !(
        currentClass &&
        classData.subject === currentClass.subject &&
        classData.courseNumber === currentClass.courseNumber
      )
  );
  return otherClasses.length <= USER_MAX_ALL_RATINGS;
};

/**
 * Formats instructor names from a course class's primary section.
 * Returns formatted text like "(John Doe)" for single instructor or "(John Doe, et al.)" for multiple.
 */
export function formatInstructorText(
  primarySection:
    | {
        meetings: Array<{
          instructors: Array<{
            givenName?: string | null;
            familyName?: string | null;
          }>;
        }>;
      }
    | null
    | undefined
): string {
  if (!primarySection) {
    return "(No instructor)";
  }

  const allInstructors: Array<{ givenName: string; familyName: string }> = [];
  primarySection.meetings.forEach((meeting) => {
    meeting.instructors.forEach((instructor) => {
      if (instructor.familyName && instructor.givenName) {
        allInstructors.push({
          givenName: instructor.givenName,
          familyName: instructor.familyName,
        });
      }
    });
  });

  if (allInstructors.length === 0) {
    return "(No instructor)";
  } else if (allInstructors.length === 1) {
    return `(${allInstructors[0].givenName} ${allInstructors[0].familyName})`;
  } else {
    return `(${allInstructors[0].givenName} ${allInstructors[0].familyName}, et al.)`;
  }
}
