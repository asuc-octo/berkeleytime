import { Reference, gql, useMutation } from "@apollo/client";

import {
  CREATE_SCHEDULE,
  CreateScheduleResponse,
  DELETE_SCHEDULE,
  DeleteScheduleResponse,
} from "@/lib/api";

export const [createSchedule] = useMutation<CreateScheduleResponse>(
  CREATE_SCHEDULE,
  {
    variables: {
      schedule: {
        name: "Untitled schedule",
        classes: [
          {
            subject: "COMPSCI",
            courseNumber: "61B",
            classNumber: "001",
            sections: [],
          },
        ],
        term: {
          year: 2024,
          semester: "Fall",
        },
      },
    },
    update(cache, { data }) {
      const schedule = data?.createSchedule;

      if (!schedule) return;

      cache.modify({
        fields: {
          schedules: (existingSchedules = []) => {
            const ref = cache.writeFragment({
              data: schedule,
              fragment: gql`
                fragment NewSchedule on Schedule {
                  _id
                  name
                  term {
                    year
                    semester
                  }
                }
              `,
            });

            return [...existingSchedules, ref];
          },
        },
      });
    },
  }
);

export const [deleteSchedule] = useMutation<DeleteScheduleResponse>(
  DELETE_SCHEDULE,
  {
    update(cache, { data }) {
      const id = data?.deleteSchedule;

      if (!id) return;

      cache.modify({
        fields: {
          schedules(existingSchedules = [], { readField }) {
            return existingSchedules.filter(
              (scheduleRef: Reference) => id !== readField("_id", scheduleRef)
            );
          },
        },
      });
    },
  }
);
