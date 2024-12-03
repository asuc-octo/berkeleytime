import { useMemo } from "react";

import { useQuery } from "@apollo/client";

import { READ_SCHEDULES, ReadSchedulesResponse, Semester } from "@/lib/api";

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
  // subject,
  // courseNumber,
  // classNumber,
}: ScheduleProps) {
  const { data } = useQuery<ReadSchedulesResponse>(READ_SCHEDULES);

  const schedules = useMemo(() => data?.schedules ?? [], [data]);

  const filteredSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.term.year === year && schedule.term.semester === semester
      ),
    [schedules, year, semester]
  );

  return (
    <div>
      {filteredSchedules.map(() => (
        <></>
      ))}
    </div>
  );
}
