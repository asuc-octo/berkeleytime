import { useQuery } from "@apollo/client";

import { READ_TERMS, Term } from "../../../lib/api/terms";

interface ReadTermsResponse {
  terms: Term[];
}

export const useReadTerms = () => {
  const query = useQuery<ReadTermsResponse>(READ_TERMS);

  return {
    ...query,
    data: query.data?.terms ?? [],
  };
};
