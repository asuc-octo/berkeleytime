import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  IScheduleEvent,
  IScheduleInput,
  READ_SCHEDULE,
  ScheduleIdentifier,
  UPDATE_SCHEDULE,
  UpdateScheduleResponse,
} from "@/lib/api";

export const useUpdateSchedule = () => {
  const mutation = useMutation<UpdateScheduleResponse>(UPDATE_SCHEDULE);

  const updateSchedule = useCallback(
    async (
      id: ScheduleIdentifier,
      schedule: Partial<Pick<IScheduleInput, "name" | "public" | "classes">> & {
        events?: Partial<Omit<IScheduleEvent, "id">>[];
      },
      options?: Omit<useMutation.Options<UpdateScheduleResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      // TODO: this also throws a lot of errors related to section not having subject and stuff
      return await mutate({
        ...options,
        variables: { id, schedule },
        refetchQueries: [{ query: READ_SCHEDULE, variables: { id } }],
      });
    },
    [mutation]
  );

  return [updateSchedule, mutation[1]] as [
    mutate: typeof updateSchedule,
    result: (typeof mutation)[1],
  ];
};
