import { useCallback } from "react";

import { MutationHookOptions, useMutation } from "@apollo/client";

import { EDIT_PLAN, EditPlanResponse, PlanInput } from "@/lib/api";

export const useEditPlan = () => {
  const mutation = useMutation<EditPlanResponse>(EDIT_PLAN, {
    update(_, { data }) {
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
