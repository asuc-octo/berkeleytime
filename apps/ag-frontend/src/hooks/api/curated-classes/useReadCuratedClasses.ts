import { useQuery } from "@apollo/client/react";

import {
  READ_CURATED_CLASSES,
  ReadCuratedClassesResponse,
} from "@/lib/api/curated-classes";

export const useReadCuratedClasses = (
  options?: Omit<useQuery.Options<ReadCuratedClassesResponse>, "variables">
) => {
  const query = useQuery<ReadCuratedClassesResponse>(
    READ_CURATED_CLASSES,
    options
  );

  return {
    ...query,
    data: query.data?.curatedClasses,
  };
};
