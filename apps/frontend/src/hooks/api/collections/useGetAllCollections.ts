import { useQuery } from "@apollo/client/react";

import { GetAllCollectionsDocument } from "@/lib/generated/graphql";
import type {
  GetAllCollectionsQuery,
  GetAllCollectionsQueryVariables,
} from "@/lib/generated/graphql";

export const useGetAllCollections = (
  options?: Parameters<
    typeof useQuery<GetAllCollectionsQuery, GetAllCollectionsQueryVariables>
  >[1]
) => {
  const query = useQuery(GetAllCollectionsDocument, options);

  return {
    ...query,
    data: query.data?.myCollections,
  };
};
