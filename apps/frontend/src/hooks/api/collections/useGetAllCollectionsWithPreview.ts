import { useQuery } from "@apollo/client/react";

import { GetAllCollectionsWithPreviewDocument } from "@/lib/generated/graphql";
import type {
  GetAllCollectionsWithPreviewQuery,
  GetAllCollectionsWithPreviewQueryVariables,
} from "@/lib/generated/graphql";

export const useGetAllCollectionsWithPreview = (
  options?: Parameters<
    typeof useQuery<
      GetAllCollectionsWithPreviewQuery,
      GetAllCollectionsWithPreviewQueryVariables
    >
  >[1]
) => {
  const query = useQuery(GetAllCollectionsWithPreviewDocument, options);

  return {
    ...query,
    data: query.data?.myCollections,
  };
};
