import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CREATE_NEW_PLAN_TERM,
  CreateNewPlanTermResponse,
  PlanTermInput,
  READ_PLAN,
  ReadPlanResponse,
} from "@/lib/api";

export const useCreateNewPlanTerm = () => {
  const mutation = useMutation<CreateNewPlanTermResponse>(
    CREATE_NEW_PLAN_TERM,
    {
      update(cache, { data }) {
        const planTerm = data?.createNewPlanTerm;

        if (!planTerm) return;

        const planData = cache.readQuery<ReadPlanResponse>({ query: READ_PLAN });
        if (!planData?.planByUser?.[0]) return;
        const planCacheId = cache.identify({ __typename: "Plan", _id: planData.planByUser[0]._id });

        if (planCacheId) {
          cache.modify({
            id: planCacheId,
            fields: {
              planTerms: (existingPlanTerms = []) => {
                const newPlanTermRef = cache.identify({ __typename: "PlanTerm", _id: planTerm._id });
                return [...existingPlanTerms, { __ref: newPlanTermRef }];
              }
            }
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
