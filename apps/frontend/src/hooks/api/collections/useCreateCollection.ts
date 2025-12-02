import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CreateCollectionDocument,
  CreateCollectionInput,
  GetAllCollectionsDocument,
  GetAllCollectionsWithPreviewDocument,
} from "@/lib/generated/graphql";

export const useCreateCollection = () => {
  const mutation = useMutation(CreateCollectionDocument);

  const createCollection = useCallback(
    async (
      input: CreateCollectionInput,
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
        ],
      });
    },
    [mutation]
  );

  return [createCollection, mutation[1]] as [
    mutate: typeof createCollection,
    result: (typeof mutation)[1],
  ];
};
