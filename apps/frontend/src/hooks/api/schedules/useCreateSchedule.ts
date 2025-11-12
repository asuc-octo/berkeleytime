import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";

import {
  CreateScheduleDocument,
  CreateScheduleInput,
} from "@/lib/generated/graphql";

export const useCreateSchedule = () => {
  const mutation = useMutation(CreateScheduleDocument);

  const createSchedule = useCallback(
    async (schedule: CreateScheduleInput) => {
      const mutate = mutation[0];

      return await mutate({ variables: { schedule } });
    },
    [mutation]
  );

  return [createSchedule, mutation[1]] as [
    mutate: typeof createSchedule,
    result: (typeof mutation)[1],
  ];
};
