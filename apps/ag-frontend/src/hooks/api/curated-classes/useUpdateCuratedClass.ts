import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  CuratedClassIdentifier,
  ICuratedClassInput,
  READ_CURATED_CLASS,
  UPDATE_CURATED_CLASS,
  UpdateCuratedClassResponse,
} from "@/lib/api";

export const useUpdateCuratedClass = () => {
  const mutation = useMutation<UpdateCuratedClassResponse>(
    UPDATE_CURATED_CLASS,
    {
      update(cache, { data }) {
        const curatedClass = data?.updateCuratedClass;

        if (!curatedClass) return;

        cache.writeQuery({
          query: READ_CURATED_CLASS,
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
    }
  );

  const updateCuratedClass = useCallback(
    async (
      id: CuratedClassIdentifier,
      curatedClass: Partial<ICuratedClassInput>,
      options?: Omit<
        useMutation.Options<UpdateCuratedClassResponse>,
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
