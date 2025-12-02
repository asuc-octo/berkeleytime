import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  DeleteCollectionDocument,
  GetAllCollectionsDocument,
  GetAllCollectionsWithPreviewDocument,
} from "@/lib/generated/graphql";

export const useDeleteCollection = () => {
  const mutation = useMutation(DeleteCollectionDocument);

  const deleteCollection = useCallback(
    async (
      id: string,
      options?: Omit<
        Parameters<typeof mutation[0]>[0],
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { id },
        refetchQueries: [
          { query: GetAllCollectionsDocument },
          { query: GetAllCollectionsWithPreviewDocument },
        ],
      });
    },
    [mutation]
  );

  return [deleteCollection, mutation[1]] as [
    mutate: typeof deleteCollection,
    result: (typeof mutation)[1],
  ];
};
