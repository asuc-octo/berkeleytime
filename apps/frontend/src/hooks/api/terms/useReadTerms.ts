import { useQuery } from "@apollo/client/react";

import {
  GetTermsDocument,
  GetTermsQuery,
  GetTermsQueryVariables,
} from "@/lib/generated/graphql";

export const useReadTerms = (
  options?: Omit<
    useQuery.Options<GetTermsQuery, GetTermsQueryVariables>,
    "variables"
  >
) => {
  const query = useQuery(GetTermsDocument, options);

  return {
    ...query,
    data: query.data?.terms,
  };
};
