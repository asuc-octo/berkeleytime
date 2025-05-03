import { useCallback } from "react";

import { gql, useMutation } from "@apollo/client";

import {
  CREATE_SCHEDULE,
  CreateScheduleResponse,
  IScheduleInput,
} from "@/lib/api";

export const useCreateSchedule = () => {
  const mutation = useMutation<CreateScheduleResponse>(CREATE_SCHEDULE, {
    update(cache, { data }) {
      const schedule = data?.createSchedule;
      

      if (!schedule) return;

      cache.modify({
        fields: {
          schedules: (existingSchedules = []) => {
            const reference = cache.writeFragment({
              data: schedule,
              fragment: gql`
                fragment CreatedSchedule on Schedule {
                  _id
                  name
                  public
                  createdBy
                  year
                  semester
                  classes {
                    class {
                      subject
                      courseNumber
                      number
                    }
                    selectedSections
                  }
                }
              `,
            });

            return [...existingSchedules, reference];
          },
        },
      });
    },
  });

  const createSchedule = useCallback(
    async (schedule: IScheduleInput) => {
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
