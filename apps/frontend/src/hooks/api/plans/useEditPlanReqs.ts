import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client";

import {
    EDIT_PLAN,
    PlanInput,
    EditPlanResponse
} from "@/lib/api";

export const useEditPlanReqs = () => {
  const mutation = useMutation<EditPlanResponse>(EDIT_PLAN, {
    update(cache, { data }) {
      const plan = data?.editPlan;

      if (!plan) return;

      // TODO(Daniel): Uncomment when done
      // cache.modify({
      //   fields: {
      //     plans: (existingPlans = []) => {
      //       const reference = cache.writeFragment({
      //         data: plan,
      //         fragment: gql`
      //           fragment CreatedPlan on Plan {
      //             uniReqsSatisfied
      //             collegeReqsSatisfied
      //           }
      //         `,
      //       });

      //       return [...existingPlans, reference];
      //     },
      //   },
      // });
    },
  });

  const updateSchedule = useCallback(
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

  return [updateSchedule, mutation[1]] as [
    mutate: typeof updateSchedule,
    result: (typeof mutation)[1],
  ];
};
