import { useMemo } from "react";

import { Reference, gql, useMutation, useQuery } from "@apollo/client";
import { ClockRotateRight } from "iconoir-react";
import { Link } from "react-router-dom";

import Button from "@/components/Button";
import {
  CREATE_SCHEDULE,
  CreateScheduleResponse,
  DELETE_SCHEDULE,
  DeleteScheduleResponse,
  GET_SCHEDULES,
  GetSchedulesResponse,
} from "@/lib/api";

import styles from "./Schedules.module.scss";

export default function Schedules() {
  const { data } = useQuery<GetSchedulesResponse>(GET_SCHEDULES);

  const schedules = useMemo(() => data?.schedules, [data]);

  const [createSchedule] = useMutation<CreateScheduleResponse>(
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

  const [deleteSchedule] = useMutation<DeleteScheduleResponse>(
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

  return (
    <div className={styles.root}>
      <div className={styles.menu}></div>
      <div className={styles.view}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <ClockRotateRight />
          </div>
          <p className={styles.title}>Jump back in</p>
        </div>
        <Button onClick={() => createSchedule()}>Create schedule</Button>
        {schedules?.map((schedule) => (
          <div key={schedule._id}>
            <Link to={schedule._id}>{schedule.name}</Link>
            <Button
              onClick={() =>
                deleteSchedule({ variables: { id: schedule._id } })
              }
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
