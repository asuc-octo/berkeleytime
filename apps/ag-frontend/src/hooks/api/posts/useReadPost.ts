import { useQuery } from "@apollo/client/react";

import { PostIdentifier, READ_POST, ReadPostResponse } from "@/lib/api/posts";

export const useReadPost = (
  id: PostIdentifier,
  options?: Omit<useQuery.Options<ReadPostResponse>, "variables">
) => {
  const query = useQuery<ReadPostResponse>(READ_POST, {
    ...options,
    variables: {
      id,
    },
  });

  return {
    ...query,
    data: query.data?.post,
  };
};
