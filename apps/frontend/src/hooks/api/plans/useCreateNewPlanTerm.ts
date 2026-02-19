import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CreateNewPlanTermDocument,
  CreateNewPlanTermMutation,
  CreateNewPlanTermMutationVariables,
  GetPlanDocument,
  GetPlanQuery,
  PlanTermInput,
} from "@/lib/generated/graphql";

export const useCreateNewPlanTerm = () => {
  const mutation = useMutation<
    CreateNewPlanTermMutation,
    CreateNewPlanTermMutationVariables
  >(
    CreateNewPlanTermDocument,
    {
      update(cache, { data }) {
        const planTerm = data?.createNewPlanTerm;

        if (!planTerm) return;

        const planData = cache.readQuery<GetPlanQuery>({
          query: GetPlanDocument,
        });
        if (!planData?.planByUser?.[0]) return;
        const planCacheId = cache.identify({
          __typename: "Plan",
          _id: planData.planByUser[0]._id,
        });

        if (planCacheId) {
          cache.modify({
            id: planCacheId,
            fields: {
              planTerms: (existingPlanTerms = []) => {
                const newPlanTermRef = cache.identify({
                  __typename: "PlanTerm",
                  _id: planTerm._id,
                });
                return [...existingPlanTerms, { __ref: newPlanTermRef }];
              },
            },
          });
        }
      },
    }
  );

  const createPlanTerm = useCallback(
    async (planTerm: PlanTermInput) => {
      const mutate = mutation[0];

      return await mutate({
        variables: {
          planTerm: planTerm,
        },
      });
    },
    [mutation]
  );

  return [createPlanTerm, mutation[1]] as [
    mutate: typeof createPlanTerm,
    result: (typeof mutation)[1],
  ];
};
