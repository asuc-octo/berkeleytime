import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  GetCollectionByIdDocument,
  RemoveClassFromCollectionDocument,
  RemoveClassInput,
} from "@/lib/generated/graphql";

export const useRemoveClassFromCollection = () => {
  const [mutate, result] = useMutation(RemoveClassFromCollectionDocument);

  const removeClassFromCollection = useCallback(
    async (
      input: RemoveClassInput,
      options?: Omit<Parameters<typeof mutate>[0], "variables">
    ) => {
      return await mutate({
        ...options,
        variables: { input },
        refetchQueries: [
          {
            query: GetCollectionByIdDocument,
            variables: { id: input.collectionId },
          },
        ],
        awaitRefetchQueries: false,
      });
    },
    [mutate]
  );

  return [removeClassFromCollection, result] as const;
};
