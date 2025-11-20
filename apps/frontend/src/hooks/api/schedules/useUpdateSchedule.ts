import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  UpdateScheduleDocument,
  UpdateScheduleInput,
  UpdateScheduleMutation,
  UpdateScheduleMutationVariables,
} from "@/lib/generated/graphql";

export const useUpdateSchedule = () => {
  const mutation = useMutation(UpdateScheduleDocument);

  const updateSchedule = useCallback(
    async (
      id: string,
      schedule: UpdateScheduleInput,
      options?: Omit<
        useMutation.Options<
          UpdateScheduleMutation,
          UpdateScheduleMutationVariables
        >,
        "variables"
      >
    ) => {
      const mutate = mutation[0];

      // TODO: this also throws a lot of errors related to section not having subject and stuff
      return await mutate({
        ...options,
        variables: { id, schedule },
        // refetchQueries: [{ query: READ_SCHEDULE, variables: { id } }],
      });
    },
    [mutation]
  );

  return [updateSchedule, mutation[1]] as [
    mutate: typeof updateSchedule,
    result: (typeof mutation)[1],
  ];
};
