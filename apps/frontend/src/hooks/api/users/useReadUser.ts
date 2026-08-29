import { useQuery } from "@apollo/client/react";

import { READ_USER } from "@/lib/api/users";
import { GetUserQuery } from "@/lib/generated/graphql";

export const useReadUser = (
  options?: useQuery.Options<GetUserQuery, Record<string, never>>
) => {
  const query = useQuery<GetUserQuery>(READ_USER, {
    fetchPolicy: "cache-first",
    ...options,
  });

  return {
    ...query,
    data: query.data?.user,
  };
};
