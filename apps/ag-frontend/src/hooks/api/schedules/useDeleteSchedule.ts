import { useCallback } from "react";

import { Reference } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

import {
  DELETE_SCHEDULE,
  DeleteScheduleResponse,
  ScheduleIdentifier,
} from "@/lib/api";

export const useDeleteSchedule = () => {
  const mutation = useMutation<DeleteScheduleResponse>(DELETE_SCHEDULE, {
    update(cache, { data }) {
      const id = data?.deleteSchedule;

      if (!id) return;

      cache.modify({
        fields: {
          schedules: (existingSchedules = [], { readField }) =>
            existingSchedules.filter(
              (reference: Reference) => readField("_id", reference) !== id
            ),
        },
      });
    },
  });

  const deleteSchedule = useCallback(
    async (
      id: ScheduleIdentifier,
      options?: Omit<useMutation.Options<DeleteScheduleResponse>, "variables">
    ) => {
      const mutate = mutation[0];

      return await mutate({ ...options, variables: { id } });
    },
    [mutation]
  );

  return [deleteSchedule, mutation[1]] as [
    mutate: typeof deleteSchedule,
    result: (typeof mutation)[1],
  ];
};
