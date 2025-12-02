import { useQuery } from "@apollo/client/react";

import {
  GetAllCollectionsWithPreviewDocument,
  GetAllCollectionsWithPreviewQuery,
  GetAllCollectionsWithPreviewQueryVariables,
} from "@/lib/generated/graphql";

export const useGetAllCollectionsWithPreview = (
  options?: Parameters<typeof useQuery<GetAllCollectionsWithPreviewQuery, GetAllCollectionsWithPreviewQueryVariables>>[1]
) => {
  const query = useQuery(GetAllCollectionsWithPreviewDocument, {
    ...options,
  });

  return {
    ...query,
    data: query.data?.myCollections,
  };
};
