import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  CuratedClassIdentifier,
  DELETE_CURATED_CLASS,
  DeleteCuratedClassResponse,
} from "@/lib/api";

export const useDeleteCuratedClass = () => {
  const mutation = useMutation<DeleteCuratedClassResponse>(
    DELETE_CURATED_CLASS,
    {
      update(cache, { data }) {
        const id = data?.deleteCuratedClass;

        if (!id) return;

        cache.modify({
          fields: {
            curatedClasses: (existingCuratedClasses = [], { readField }) =>
              existingCuratedClasses.filter(
                (reference: Reference) => readField("_id", reference) !== id
              ),
          },
        });
      },
    }
  );

  const deleteCuratedClass = useCallback(
    async (
      id: CuratedClassIdentifier,
      options?: Omit<
        useMutation.Options<DeleteCuratedClassResponse>,
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({ ...options, variables: { id } });
    },
    [mutation]
  );

  return [deleteCuratedClass, mutation[1]] as [
    mutate: typeof deleteCuratedClass,
    result: (typeof mutation)[1],
  ];
};
