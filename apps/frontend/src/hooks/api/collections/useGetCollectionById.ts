import { useQuery } from "@apollo/client/react";

import { GetCollectionByIdDocument } from "@/lib/generated/graphql";
import type {
  GetCollectionByIdQuery,
  GetCollectionByIdQueryVariables,
} from "@/lib/generated/graphql";

export const useGetCollectionById = (
  id: string,
  options?: Omit<
    Parameters<
      typeof useQuery<GetCollectionByIdQuery, GetCollectionByIdQueryVariables>
    >[1],
    "variables"
  >
) => {
  const query = useQuery(GetCollectionByIdDocument, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    ...query,
    data: query.data?.myCollectionById,
  };
};
