import { useQuery } from "@apollo/client/react";

import { GET_COMMENTS } from "@/lib/api/discussion";

export const useGetComments = (
  courseId: string,
  options?: Omit<Parameters<typeof useQuery>[1], "variables">
) => {
  const query = useQuery(GET_COMMENTS, {
    ...(options || {}),
    variables: {
      courseId,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const queryData = query.data as { comments?: unknown[] } | undefined;

  return {
    ...query,
    data: queryData?.comments ?? [],
  };
};

