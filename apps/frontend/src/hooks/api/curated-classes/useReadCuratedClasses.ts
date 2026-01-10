import { useQuery } from "@apollo/client/react";

import "@/lib/api/curated-classes";
import {
  GetCuratedClassesDocument,
  GetCuratedClassesQuery,
} from "@/lib/generated/graphql";

export const useReadCuratedClasses = (
  options?: Omit<useQuery.Options<GetCuratedClassesQuery>, "variables">
) => {
  const query = useQuery<GetCuratedClassesQuery>(
    GetCuratedClassesDocument,
    options
  );

  return {
    ...query,
    data: query.data?.curatedClasses,
  };
};
