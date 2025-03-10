import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_DISCUSSIONS_BY_COURSE, IDiscussion } from "@/lib/api";

export const useReadDiscussion = (
  courseId: string,
  options?: Omit<
    QueryHookOptions<
      { getDiscussionsByCourse: IDiscussion[] },
      { courseId: string }
    >,
    "variables"
  >
) => {
  const { data, loading, error } = useQuery<
    { getDiscussionsByCourse: IDiscussion[] },
    { courseId: string }
  >(GET_DISCUSSIONS_BY_COURSE, {
    ...options,
    variables: { courseId },
  });

  return {
    discussions: data?.getDiscussionsByCourse,
    loading,
    error,
  };
};
