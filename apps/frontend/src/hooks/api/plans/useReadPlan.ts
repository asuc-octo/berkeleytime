import { useQuery } from "@apollo/client/react";

import {
  GetPlanDocument,
  GetPlanQuery,
  GetPlanQueryVariables,
} from "@/lib/generated/graphql";

export const useReadPlan = (
  options?: Omit<
    useQuery.Options<GetPlanQuery, GetPlanQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetPlanDocument, options);

  return {
    ...query,
    data: query.data?.planByUser[0],
  };
};
