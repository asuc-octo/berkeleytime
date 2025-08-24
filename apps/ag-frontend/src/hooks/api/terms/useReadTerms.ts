import { useQuery } from "@apollo/client/react";

import { READ_TERMS, ReadTermsResponse } from "@/lib/api";

export const useReadTerms = (
  options?: Omit<useQuery.Options<ReadTermsResponse>, "variables">
) => {
  const query = useQuery<ReadTermsResponse>(READ_TERMS, options);

  return {
    ...query,
    data: query.data?.terms,
  };
};
