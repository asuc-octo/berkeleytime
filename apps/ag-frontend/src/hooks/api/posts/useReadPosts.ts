import { useQuery } from "@apollo/client/react";

import { READ_POSTS, ReadPostsResponse } from "@/lib/api/posts";

export const useReadPosts = (
  options?: Omit<useQuery.Options<ReadPostsResponse>, "variables">
) => {
  const query = useQuery<ReadPostsResponse>(READ_POSTS, options);

  return {
    ...query,
    data: query.data?.posts,
  };
};
