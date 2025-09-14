import { useMemo } from "react";

import { useQuery } from "@apollo/client";

import {
  GET_DISCUSSION_COMMENTS,
  DiscussionCommentsResponse,
  DiscussionCommentFilter,
} from "@/lib/api/discussions";

export const useDiscussionComments = (
  filter?: DiscussionCommentFilter,
  limit?: number,
  offset?: number
) => {
  
  const { data, loading, error, refetch } = useQuery<DiscussionCommentsResponse>(
    GET_DISCUSSION_COMMENTS,
    {
      variables: { 
        filter, 
        limit: limit || null, 
        offset: offset || null 
      },
      fetchPolicy: "cache-and-network", // Use cache but also fetch from network
      errorPolicy: "all", // Return both data and errors
      notifyOnNetworkStatusChange: true, // Notify on network status changes
    }
  );

  const comments = useMemo(() => {
    if (!data?.discussionComments) return [];

    return [...data.discussionComments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  return {
    comments,
    loading,
    error,
    refetch,
  };
};
