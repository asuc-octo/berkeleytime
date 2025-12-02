import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import { DeleteCollectionDocument } from "@/lib/generated/graphql";

export const useDeleteCollection = () => {
  const [mutate, result] = useMutation(DeleteCollectionDocument);

  const deleteCollection = useCallback(
    async (
      id: string,
      options?: Omit<Parameters<typeof mutate>[0], "variables">
    ) => {
      return await mutate({
        ...options,
        variables: { id },
        // Optimistically remove from cache immediately
        update(cache) {
          cache.modify({
            fields: {
              myCollections: (existing = [], { readField }) =>
                existing.filter(
                  (ref: Reference) => readField("_id", ref) !== id
                ),
            },
          });
          cache.evict({ id: `Collection:${id}` });
          cache.gc();
        },
        optimisticResponse: {
          __typename: "Mutation",
          deleteCollection: true,
        },
      });
    },
    [mutate]
  );

  return [deleteCollection, result] as const;
};
