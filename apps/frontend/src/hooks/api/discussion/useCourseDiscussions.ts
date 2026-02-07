import { useQuery } from "@apollo/client/react";

import {
  GetCourseDiscussionsDocument,
  GetCourseDiscussionsQuery,
  GetCourseDiscussionsQueryVariables,
} from "@/lib/generated/graphql";

const POLL_INTERVAL_MS = 15_000;

/**
 * Fetches course discussions (comments) for a course. Automatically refetches
 * on an interval so new comments appear without a full page reload.
 */
export const useCourseDiscussions = (
  courseId: string,
  options?: {
    pollInterval?: number;
    skip?: boolean;
  }
) => {
  const { pollInterval = POLL_INTERVAL_MS, skip = false } = options ?? {};

  const query = useQuery<
    GetCourseDiscussionsQuery,
    GetCourseDiscussionsQueryVariables
  >(GetCourseDiscussionsDocument, {
    variables: { courseId },
    skip: skip || !courseId,
    pollInterval: skip || !courseId ? undefined : pollInterval,
  });

  return {
    ...query,
    discussions: query.data?.courseDiscussions ?? [],
  };
};
