import { QueryHookOptions, useQuery } from "@apollo/client";

import { GET_COMMENTS, getCommentsResponse } from "@/lib/api";

export const useGetComments = (
  subject: string,
  number: string,
  userEmail?: string | null, 
  options?: Omit<QueryHookOptions<getCommentsResponse>, "variables">
) => {
  const query = useQuery<getCommentsResponse>(GET_COMMENTS, {
    ...options,
    variables: {
      subject,
      number,
      userEmail: userEmail || undefined,
    },
  });

  return {
    ...query,
    data: query.data?.comments, // Return the comments array
  };
};
