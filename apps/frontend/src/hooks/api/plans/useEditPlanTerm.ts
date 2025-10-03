import { useCallback } from "react";

import { useMutation } from "@apollo/client";

import {
  EDIT_PLAN_TERM,
  EditPlanTermInput,
  EditPlanTermResponse,
} from "@/lib/api";

export const useEditPlanTerm = () => {
  const mutation = useMutation<EditPlanTermResponse>(EDIT_PLAN_TERM, {
    refetchQueries: ["GetPlan"],
    update(_, { data }) {
      const planTerm = data?.editPlanTerm;

      if (!planTerm) return;

      // TODO(Daniel): Uncomment when done
      // cache.modify({
      //   id: cache.identify({ __typename: "PlanTerm", _id: planTerm._id }),
      //   fields: {
      //     name: () => planTerm.name,
      //     year: () => planTerm.year,
      //     term: () => planTerm.term,
      //     courses: () => planTerm.courses,
      //     hidden: () => planTerm.hidden,
      //     status: () => planTerm.status,
      //     pinned: () => planTerm.pinned,
      //   },
      // });
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
