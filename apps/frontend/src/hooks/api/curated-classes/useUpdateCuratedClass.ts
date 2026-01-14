import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  GetCuratedClassDocument,
  UpdateCuratedClassDocument,
  UpdateCuratedClassInput,
  UpdateCuratedClassMutation,
  UpdateCuratedClassMutationVariables,
} from "@/lib/generated/graphql";

export const useUpdateCuratedClass = () => {
  const mutation = useMutation(UpdateCuratedClassDocument, {
    update(cache, { data }) {
      const curatedClass = data?.updateCuratedClass;

      if (!curatedClass) return;

      cache.writeQuery({
        query: GetCuratedClassDocument,
        variables: { id: curatedClass._id },
        data: {
          curatedClass,
        },
      });

      cache.modify({
        fields: {
          curatedClasses: (existingCuratedClasses = [], { readField }) =>
            existingCuratedClasses.map((reference: Reference) =>
              readField("_id", reference) === curatedClass._id
                ? { ...reference, ...curatedClass }
                : reference
            ),
        },
      });
    },
  });

  const updateCuratedClass = useCallback(
    async (
      id: string,
      curatedClass: UpdateCuratedClassInput,
      options?: Omit<
        useMutation.Options<
          UpdateCuratedClassMutation,
          UpdateCuratedClassMutationVariables
        >,
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { id, curatedClass },
      });
    },
    [mutation]
  );

  return [updateCuratedClass, mutation[1]] as [
    mutate: typeof updateCuratedClass,
    result: (typeof mutation)[1],
  ];
};
