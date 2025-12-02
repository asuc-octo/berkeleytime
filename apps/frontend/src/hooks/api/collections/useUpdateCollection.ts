import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  UpdateCollectionDocument,
  UpdateCollectionInput,
  GetAllCollectionsDocument,
  GetAllCollectionsWithPreviewDocument,
  GetCollectionByIdDocument,
} from "@/lib/generated/graphql";

export const useUpdateCollection = () => {
  const mutation = useMutation(UpdateCollectionDocument);

  const updateCollection = useCallback(
    async (
      id: string,
      input: UpdateCollectionInput,
      options?: Omit<
        Parameters<typeof mutation[0]>[0],
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { id, input },
        refetchQueries: [
          { query: GetAllCollectionsDocument },
          { query: GetAllCollectionsWithPreviewDocument },
          { query: GetCollectionByIdDocument, variables: { id } },
        ],
      });
    },
    [mutation]
  );

  return [updateCollection, mutation[1]] as [
    mutate: typeof updateCollection,
    result: (typeof mutation)[1],
  ];
};
