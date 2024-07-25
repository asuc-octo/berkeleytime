import { useMemo } from "react";

import { useQuery } from "@apollo/client";

import { GET_SCHEDULES, GetSchedulesResponse, Semester } from "@/lib/api";

import styles from "./Schedule.module.scss";

interface ScheduleProps {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

export default function Schedule({
  year,
  semester,
  subject,
  courseNumber,
  classNumber,
}: ScheduleProps) {
  const { data } = useQuery<GetSchedulesResponse>(GET_SCHEDULES);

  const schedules = useMemo(() => data?.schedulesByUser ?? [], [data]);

  const filteredSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.term.year === year && schedule.term.semester === semester
      ),
    [data, year, semester, subject, courseNumber, classNumber]
  );

  return (
    <div className={styles.root}>
      {filteredSchedules.map(() => (
        <></>
      ))}
    </div>
  );
}
