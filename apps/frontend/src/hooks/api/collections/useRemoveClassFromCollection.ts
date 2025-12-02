import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  RemoveClassFromCollectionDocument,
  RemoveClassInput,
  GetAllCollectionsDocument,
  GetAllCollectionsWithPreviewDocument,
  GetCollectionByIdDocument,
} from "@/lib/generated/graphql";

export const useRemoveClassFromCollection = () => {
  const mutation = useMutation(RemoveClassFromCollectionDocument);

  const removeClassFromCollection = useCallback(
    async (
      input: RemoveClassInput,
      options?: Omit<
        Parameters<typeof mutation[0]>[0],
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { input },
        refetchQueries: [
          { query: GetAllCollectionsDocument },
          { query: GetAllCollectionsWithPreviewDocument },
          { query: GetCollectionByIdDocument, variables: { id: input.collectionId } },
        ],
      });
    },
    [mutation]
  );

  return [removeClassFromCollection, mutation[1]] as [
    mutate: typeof removeClassFromCollection,
    result: (typeof mutation)[1],
  ];
};
