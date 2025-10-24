import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import { REMOVE_PLAN_TERM_BY_ID } from "@/lib/api";

export const useRemovePlanTermByID = () => {
  const mutation = useMutation(REMOVE_PLAN_TERM_BY_ID, {});

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
