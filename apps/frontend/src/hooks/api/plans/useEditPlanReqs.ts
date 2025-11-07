import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client/react";

import { EDIT_PLAN, EditPlanResponse, PlanInput } from "@/lib/api";

export const useEditPlan = () => {
  const mutation = useMutation<EditPlanResponse>(EDIT_PLAN, {
    update(cache, { data }) {
      const plan = data?.editPlan;

      if (!plan) return;

      cache.modify({
        id: `Plan:${plan._id}`,
        fields: {
          majors: () => plan.majors,
          minors: () => plan.minors,
          colleges: () => plan.colleges,
          labels: () => plan.labels,
          uniReqsSatisfied: () => plan.uniReqsSatisfied,
          collegeReqsSatisfied: () => plan.collegeReqsSatisfied,
        },
      });
    },
  });

  const updatedPlan = useCallback(
    async (
      plan: PlanInput,
      options?: Omit<MutationHookOptions<EditPlanResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { plan },
      });
    },
    [mutation]
  );

  return [updatedPlan, mutation[1]] as [
    mutate: typeof updatedPlan,
    result: (typeof mutation)[1],
  ];
};
