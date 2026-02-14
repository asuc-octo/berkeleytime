import { useQuery } from "@apollo/client/react";

import {
  GetCommentsDocument,
  GetCommentsQuery,
  GetCommentsQueryVariables,
} from "@/lib/generated/graphql";

export function useGetComments(
  subject: string,
  courseNumber: string,
  userEmail?: string
) {
  return useQuery<GetCommentsQuery, GetCommentsQueryVariables>(
    GetCommentsDocument,
    {
      variables: { subject, courseNumber, userEmail },
      fetchPolicy: "cache-and-network",
    }
  );
}