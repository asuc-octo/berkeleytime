import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  EditPlanDocument,
  EditPlanMutation,
  EditPlanMutationVariables,
  GetPlanDocument,
  PlanInput,
} from "@/lib/generated/graphql";

export const useEditPlan = () => {
  const mutation = useMutation(EditPlanDocument, {
    refetchQueries: [{ query: GetPlanDocument }],
    update(cache, { data }) {
      const plan = data?.editPlan;

      if (!plan?._id) return;

      cache.modify({
        id: `Plan:${plan._id}`,
        fields: {
          majors: () => plan.majors,
          minors: () => plan.minors,
          colleges: () => plan.colleges,
          labels: () => plan.labels,
          ...(plan.selectedPlanRequirements && {
            selectedPlanRequirements: () => plan.selectedPlanRequirements,
          }),
        },
      });
    },
  });

  const updatedPlan = useCallback(
    async (
      plan: PlanInput,
      options?: Omit<
        useMutation.Options<EditPlanMutation, EditPlanMutationVariables>,
        "variables"
      >
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
