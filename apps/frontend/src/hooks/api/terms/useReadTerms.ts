import { QueryHookOptions, useQuery } from "@apollo/client";

import { READ_TERMS, ReadTermsResponse } from "@/lib/api";

export const useReadTerms = (
  options?: Omit<QueryHookOptions<ReadTermsResponse>, "variables">
) => {
  const query = useQuery<ReadTermsResponse>(READ_TERMS, options);

  return {
    ...query,
    data: query.data?.terms,
  };
};
