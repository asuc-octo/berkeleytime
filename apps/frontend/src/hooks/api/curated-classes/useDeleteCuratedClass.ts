import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  DeleteCuratedClassDocument,
  DeleteCuratedClassMutation,
  DeleteCuratedClassMutationVariables,
} from "@/lib/generated/graphql";

export const useDeleteCuratedClass = () => {
  const mutation = useMutation(DeleteCuratedClassDocument, {
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
  });

  const deleteCuratedClass = useCallback(
    async (
      id: string,
      options?: Omit<
        useMutation.Options<
          DeleteCuratedClassMutation,
          DeleteCuratedClassMutationVariables
        >,
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
