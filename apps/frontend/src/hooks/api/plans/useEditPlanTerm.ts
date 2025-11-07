import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  EDIT_PLAN_TERM,
  EditPlanTermInput,
  EditPlanTermResponse,
} from "@/lib/api";

export const useEditPlanTerm = () => {
  const mutation = useMutation<EditPlanTermResponse>(EDIT_PLAN_TERM, {
    update(cache, { data }) {
      const planTerm = data?.editPlanTerm;

      if (!planTerm) return;

      cache.modify({
        id: `PlanTerm:${planTerm._id}`,
        fields: {
          name: () => planTerm.name,
          year: () => planTerm.year,
          term: () => planTerm.term,
          hidden: () => planTerm.hidden,
          status: () => planTerm.status,
          pinned: () => planTerm.pinned,
        },
      });
    },
  });

  const editPlanTerm = useCallback(
    async (id: string, planTerm: EditPlanTermInput) => {
      const mutate = mutation[0];

      return await mutate({
        variables: {
          id: id,
          planTerm: planTerm,
        },
      });
    },
    [mutation]
  );

  return [editPlanTerm, mutation[1]] as [
    mutate: typeof editPlanTerm,
    result: (typeof mutation)[1],
  ];
};
