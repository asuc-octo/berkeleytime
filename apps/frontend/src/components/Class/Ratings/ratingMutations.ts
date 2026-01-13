import { useMutation } from "@apollo/client/react";
import { DocumentNode } from "graphql";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";

import {
  CreateRatingsMutation,
  CreateRatingsMutationVariables,
  DeleteRatingsMutation,
  DeleteRatingsMutationVariables,
  Semester,
} from "@/lib/generated/graphql";

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
  createRatingsMutation: useMutation.MutationFunction<
    CreateRatingsMutation,
    CreateRatingsMutationVariables
  >;
  classIdentifiers: ClassIdentifiers;
  refetchQueries?: RefetchQuery[];
}

export async function submitRating({
  metricValues,
  termInfo,
  createRatingsMutation,
  classIdentifiers,
  refetchQueries = [],
}: SubmitRatingOptions) {
  // Validate required metrics are present
  const missingRequiredMetrics = REQUIRED_METRICS.filter(
    (metric) =>
      metricValues[metric] === null || metricValues[metric] === undefined
  );
  if (missingRequiredMetrics.length > 0) {
    throw new Error(
      `Missing required metrics: ${missingRequiredMetrics.join(", ")}`
    );
  }

  const metrics = METRIC_NAMES.filter(
    (metric) =>
      metricValues[metric] !== null && metricValues[metric] !== undefined
  ).map((metric) => ({
    metricName: metric,
    value: metricValues[metric] as number,
  }));

  if (metrics.length === 0) {
    throw new Error("No populated metrics");
  }

  await createRatingsMutation({
    variables: {
      subject: classIdentifiers.subject,
      courseNumber: classIdentifiers.courseNumber,
      semester: termInfo.semester,
      year: termInfo.year,
      classNumber: classIdentifiers.number,
      metrics,
    },
    refetchQueries,
    awaitRefetchQueries: true,
  });
}

interface DeleteRatingOptions {
  deleteRatingsMutation: useMutation.MutationFunction<
    DeleteRatingsMutation,
    DeleteRatingsMutationVariables
  >;
  classIdentifiers: ClassIdentifiers;
  refetchQueries?: RefetchQuery[];
}

export async function deleteRating({
  deleteRatingsMutation,
  classIdentifiers,
  refetchQueries = [],
}: DeleteRatingOptions) {
  await deleteRatingsMutation({
    variables: {
      subject: classIdentifiers.subject,
      courseNumber: classIdentifiers.courseNumber,
    },
    refetchQueries,
    awaitRefetchQueries: true,
  });
}
