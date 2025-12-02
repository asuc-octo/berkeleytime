import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  AddClassToCollectionDocument,
  AddClassInput,
  GetAllCollectionsDocument,
  GetAllCollectionsWithPreviewDocument,
  GetCollectionByIdDocument,
} from "@/lib/generated/graphql";

export const useAddClassToCollection = () => {
  const mutation = useMutation(AddClassToCollectionDocument);

  const addClassToCollection = useCallback(
    async (
      input: AddClassInput,
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

  return [addClassToCollection, mutation[1]] as [
    mutate: typeof addClassToCollection,
    result: (typeof mutation)[1],
  ];
};
