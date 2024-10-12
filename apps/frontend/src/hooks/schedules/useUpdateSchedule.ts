import { useCallback } from "react";

import { MutationHookOptions, Reference, useMutation } from "@apollo/client";

import {
  IScheduleInput,
  ScheduleIdentifier,
  UPDATE_SCHEDULE,
  UpdateScheduleResponse,
} from "@/lib/api";

export const useUpdateSchedule = () => {
  const mutation = useMutation<UpdateScheduleResponse>(UPDATE_SCHEDULE, {
    update(cache, { data }) {
      const schedule = data?.updateSchedule;

      if (!schedule) return;

      cache.modify({
        fields: {
          // TODO: Properly type
          schedules: (existingSchedules = [], { readField }) =>
            existingSchedules.map((reference: Reference) =>
              readField("_id", reference) === schedule._id
                ? { ...reference, ...schedule }
                : reference
            ),
        },
      });
    },
  });

  const updateSchedule = useCallback(
    async (
      id: ScheduleIdentifier,
      schedule: Partial<Pick<IScheduleInput, "name" | "public" | "classes">>,
      options?: Omit<MutationHookOptions<UpdateScheduleResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      return await mutate({
        ...options,
        variables: { id, schedule },
      });
    },
    [mutation]
  );

  return [updateSchedule, mutation[1]] as [
    mutate: typeof updateSchedule,
    result: (typeof mutation)[1],
  ];
};
