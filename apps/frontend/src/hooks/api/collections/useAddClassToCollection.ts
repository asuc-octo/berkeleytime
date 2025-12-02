import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  AddClassInput,
  AddClassToCollectionDocument,
  GetCollectionByIdDocument,
} from "@/lib/generated/graphql";

export const useAddClassToCollection = () => {
  const [mutate, result] = useMutation(AddClassToCollectionDocument);

  const addClassToCollection = useCallback(
    async (
      input: AddClassInput,
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

  return [addClassToCollection, result] as const;
};
