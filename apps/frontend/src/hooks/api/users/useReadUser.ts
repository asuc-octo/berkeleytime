import { useQuery } from "@apollo/client/react";

import {
  GetUserDocument,
  GetUserQuery,
  GetUserQueryVariables,
} from "@/lib/generated/graphql";

export const useReadUser = (
  options?: useQuery.Options<GetUserQuery, GetUserQueryVariables>
) => {
  const query = useQuery(GetUserDocument, {
    fetchPolicy: "cache-first",
    ...options,
  });

  return {
    ...query,
    data: query.data?.user,
  };
};
