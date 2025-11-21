import { MutationFunction } from "@apollo/client";
import { DocumentNode } from "graphql";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";

import { IUserRatingClass } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import { MetricData } from "./metricsUtil";

const METRIC_NAMES = Object.values(MetricName) as MetricName[];

export interface ClassIdentifiers {
  subject: string;
  courseNumber: string;
  number: string;
}

type RefetchQuery = {
  query: DocumentNode;
  variables?: Record<string, unknown>;
};

interface SubmitRatingOptions {
  metricValues: MetricData;
  termInfo: { semester: Semester; year: number };
  createRatingMutation: MutationFunction<any, any>;
  deleteRatingMutation: MutationFunction<any, any>;
  classIdentifiers: ClassIdentifiers;
  currentRatings?: IUserRatingClass | null;
  refetchQueries?: RefetchQuery[];
}

export async function submitRating({
  metricValues,
  termInfo,
  createRatingMutation,
  deleteRatingMutation,
  classIdentifiers,
  currentRatings,
  refetchQueries = [],
}: SubmitRatingOptions) {
  const populatedMetrics = METRIC_NAMES.filter((metricName) => {
    const value = metricValues[metricName];
    return value !== null && value !== undefined;
  });

  if (populatedMetrics.length === 0) {
    throw new Error("No populated metrics");
  }

  const missingRequiredMetrics = REQUIRED_METRICS.filter(
    (metric) => !populatedMetrics.includes(metric)
  );
  if (missingRequiredMetrics.length > 0) {
    throw new Error(
      `Missing required metrics: ${missingRequiredMetrics.join(", ")}`
    );
  }

  await Promise.all(
    METRIC_NAMES.map((metric) => {
      const value = metricValues[metric];
      if (!populatedMetrics.includes(metric)) {
        const metricExists = currentRatings?.metrics?.some(
          (m) => m.metricName === metric
        );
        if (metricExists) {
          return deleteRatingMutation({
            variables: {
              subject: classIdentifiers.subject,
              courseNumber: classIdentifiers.courseNumber,
              semester: termInfo.semester,
              year: termInfo.year,
              classNumber: classIdentifiers.number,
              metricName: metric,
            },
            refetchQueries,
            awaitRefetchQueries: true,
          });
        }
        return Promise.resolve();
      }

      if (
        currentRatings?.semester === termInfo.semester &&
        currentRatings?.year === termInfo.year
      ) {
        const currentMetric = currentRatings.metrics.find(
          (m) => m.metricName === metric
        );
        if (currentMetric?.value === value) {
          return Promise.resolve();
        }
      }

      if (value === undefined) {
        return Promise.resolve();
      }

      return createRatingMutation({
        variables: {
          subject: classIdentifiers.subject,
          courseNumber: classIdentifiers.courseNumber,
          semester: termInfo.semester,
          year: termInfo.year,
          classNumber: classIdentifiers.number,
          metricName: metric,
          value,
        },
        refetchQueries,
        awaitRefetchQueries: true,
      });
    })
  );
}

interface DeleteRatingOptions {
  userRating: IUserRatingClass;
  deleteRatingMutation: MutationFunction<any, any>;
  classIdentifiers: ClassIdentifiers;
  refetchQueries?: RefetchQuery[];
}

export async function deleteRating({
  userRating,
  deleteRatingMutation,
  classIdentifiers,
  refetchQueries = [],
}: DeleteRatingOptions) {
  await Promise.all(
    userRating.metrics.map((metric) =>
      deleteRatingMutation({
        variables: {
          subject: classIdentifiers.subject,
          courseNumber: classIdentifiers.courseNumber,
          semester: userRating.semester,
          year: userRating.year,
          classNumber: classIdentifiers.number,
          metricName: metric.metricName,
        },
        refetchQueries,
        awaitRefetchQueries: true,
      })
    )
  );
}
