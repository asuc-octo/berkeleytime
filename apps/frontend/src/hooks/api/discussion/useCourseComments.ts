import { useQuery } from "@apollo/client/react";

import {
  GetCourseCommentsDocument,
  GetCourseCommentsQuery,
  GetCourseCommentsQueryVariables,
} from "@/lib/generated/graphql";

export const useCourseComments = (
  subject: string,
  courseNumber: string,
  options?: Omit<
    useQuery.Options<GetCourseCommentsQuery, GetCourseCommentsQueryVariables>,
    "variables"
  >
) => {
  return useQuery(GetCourseCommentsDocument, {
    ...options,
    variables: { subject, courseNumber },
  });
};
