import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  RemovePlanTermByIdDocument,
  RemovePlanTermByIdMutation,
  RemovePlanTermByIdMutationVariables,
} from "@/lib/generated/graphql";

export const useRemovePlanTermByID = () => {
  const mutation = useMutation<
    RemovePlanTermByIdMutation,
    RemovePlanTermByIdMutationVariables
  >(RemovePlanTermByIdDocument, {
    update(cache, _, { variables }) {
      if (!variables) return;
      const removedId = variables.removePlanTermByIdId;

      cache.evict({
        id: `PlanTerm:${removedId}`,
      });

      cache.modify({
        id: "ROOT_QUERY",
        fields: {
          planByUser(existingPlanRefs = []) {
            return existingPlanRefs.map((planRef: { __ref: string }) => {
              cache.modify({
                id: planRef.__ref,
                fields: {
                  planTerms(existingPlanTermRefs = [], { readField }) {
                    return existingPlanTermRefs.filter(
                      (planTermRef: { __ref: string }) =>
                        readField("_id", planTermRef) !== removedId
                    );
                  },
                },
              });

              return planRef;
            });
          },
        },
      });
      cache.gc();
    },
  });

  const removePlanTermByID = useCallback(
    async (id: string) => {
      const mutate = mutation[0];

      return await mutate({
        variables: {
          removePlanTermByIdId: id,
        },
      });
    },
    [mutation]
  );

  return [removePlanTermByID, mutation[1]] as [
    mutate: typeof removePlanTermByID,
    result: (typeof mutation)[1],
  ];
};
