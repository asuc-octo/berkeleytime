import { useQuery } from "@apollo/client/react";

import {
  GetCommentsDocument,
  GetCommentsQuery,
  GetCommentsQueryVariables,
} from "../../../lib/generated/graphql";

export const useGetComments = (courseId: string) => {
  const { data, loading, error, refetch } = useQuery<
    GetCommentsQuery,
    GetCommentsQueryVariables
  >(GetCommentsDocument, {
    variables: { courseId },
    fetchPolicy: "cache-and-network",
  });

  return {
    comments: data?.comments ?? [],
    loading,
    error,
    refetch,
  };
};
