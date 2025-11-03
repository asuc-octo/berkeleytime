import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CREATE_NEW_PLAN_TERM,
  CreateNewPlanTermResponse,
  PlanTermInput,
} from "@/lib/api";

export const useCreateNewPlanTerm = () => {
  const mutation = useMutation<CreateNewPlanTermResponse>(
    CREATE_NEW_PLAN_TERM,
    {
      update(_, { data }) {
        const planTerm = data?.createNewPlanTerm;

        if (!planTerm) return;
      },
      refetchQueries: ["GetPlan"],
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
