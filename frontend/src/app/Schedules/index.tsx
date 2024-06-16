import { Reference, gql, useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

import Button from "@/components/Button";
import {
  AccountResponse,
  CREATE_SCHEDULE,
  CreateScheduleResponse,
  DELETE_SCHEDULE,
  GET_ACCOUNT,
  GET_SCHEDULES,
  GetSchedulesResponse,
} from "@/lib/api";

export default function Schedules() {
  const { data: account } = useQuery<AccountResponse>(GET_ACCOUNT);

  const { data: schedules } = useQuery<GetSchedulesResponse>(GET_SCHEDULES, {
    variables: {
      createdBy: account?.user.email,
    },
  });

  const [createSchedule] = useMutation<CreateScheduleResponse>(
    CREATE_SCHEDULE,
    {
      variables: {
        name: "Untitled schedule",
        term: {
          year: 2024,
          semester: "Spring",
        },
        createdBy: account?.user.email,
      },
      update(cache, { data }) {
        const schedule = data?.createNewSchedule;

        if (!schedule) return;

        cache.modify({
          fields: {
            schedulesByUser(existingSchedules = []) {
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

  const [deleteSchedule] = useMutation(DELETE_SCHEDULE, {
    update(cache, { data }) {
      const id = data?.removeScheduleByID;

      if (!id) return;

      cache.modify({
        fields: {
          schedulesByUser(existingSchedules = [], { readField }) {
            return existingSchedules.filter(
              (scheduleRef: Reference) => id !== readField("_id", scheduleRef)
            );
          },
        },
      });
    },
  });

  return (
    <>
      <Button onClick={() => createSchedule()}>Create schedule</Button>
      {schedules?.schedulesByUser.map((schedule) => (
        <div key={schedule._id}>
          <Link to={schedule._id}>{schedule.name}</Link>
          <Button
            onClick={() => deleteSchedule({ variables: { id: schedule._id } })}
          >
            Delete
          </Button>
        </div>
      ))}
    </>
  );
}
