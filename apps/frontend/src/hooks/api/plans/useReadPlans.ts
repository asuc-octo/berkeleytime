import { useQuery } from "@apollo/client/react";

import {
  GetPlansDocument,
  GetPlansQuery,
  GetPlansQueryVariables,
} from "@/lib/generated/graphql";

export const useReadPlans = (
  options?: Omit<
    useQuery.Options<GetPlansQuery, GetPlansQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetPlansDocument, options);

  return {
    ...query,
    data: query.data?.planByUser,
  };
};
