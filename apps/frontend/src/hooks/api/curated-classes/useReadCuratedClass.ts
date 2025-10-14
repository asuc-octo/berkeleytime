import { useQuery } from "@apollo/client/react";

import {
  CuratedClassIdentifier,
  READ_CURATED_CLASS,
  ReadCuratedClassResponse,
} from "@/lib/api/curated-classes";

export const useReadCuratedClass = (
  id: CuratedClassIdentifier,
  options?: Omit<useQuery.Options<ReadCuratedClassResponse>, "variables">
) => {
  const query = useQuery<ReadCuratedClassResponse>(READ_CURATED_CLASS, {
    ...options,
    variables: {
      id,
    },
  });

  return {
    ...query,
    data: query.data?.curatedClass,
  };
};
