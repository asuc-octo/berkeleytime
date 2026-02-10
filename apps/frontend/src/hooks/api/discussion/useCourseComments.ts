import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import {
  GetCourseCommentsDocument,
  GetCourseCommentsQuery,
  GetCourseCommentsQueryVariables,
} from "@/lib/generated/graphql";

type UseCourseCommentsOptions = {
  courseId?: GetCourseCommentsQueryVariables["courseId"] | null;
};

type CourseComment = NonNullable<
  NonNullable<GetCourseCommentsQuery["courseComments"]>[number]
>;

export const useCourseComments = ({ courseId }: UseCourseCommentsOptions) => {
  const query = useQuery<
    GetCourseCommentsQuery,
    GetCourseCommentsQueryVariables
  >(GetCourseCommentsDocument, {
    variables: { courseId: courseId ?? "" },
    skip: !courseId,
    fetchPolicy: "no-cache",
  });

  const comments = useMemo(() => {
    const rawComments = query.data?.courseComments ?? [];
    return rawComments.filter(Boolean) as CourseComment[];
  }, [query.data?.courseComments]);

  return {
    ...query,
    comments,
  };
};
