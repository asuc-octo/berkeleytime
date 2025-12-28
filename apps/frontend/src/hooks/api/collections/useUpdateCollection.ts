import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  UpdateCollectionDocument,
  UpdateCollectionInput,
} from "@/lib/generated/graphql";

export const useUpdateCollection = () => {
  const [mutate, result] = useMutation(UpdateCollectionDocument);

  const updateCollection = useCallback(
    async (
      id: string,
      input: UpdateCollectionInput,
      options?: Omit<Parameters<typeof mutate>[0], "variables">
    ) => {
      return await mutate({
        ...options,
        variables: { id, input },
        update(cache) {
          cache.modify({
            id: `Collection:${id}`,
            fields: {
              ...(input.name !== undefined && {
                name: () => input.name,
              }),
              ...(input.color !== undefined && {
                color: () => input.color,
              }),
              ...(input.pinned !== undefined && {
                pinnedAt: () =>
                  input.pinned ? new Date().toISOString() : null,
              }),
            },
          });
        },
      });
    },
    [mutate]
  );

  return [updateCollection, result] as const;
};
