import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";

import { READ_SCHEDULES, ReadSchedulesResponse, Semester } from "@/lib/api";
import { ReadSchedulesDocument } from "@/lib/generated/graphql";

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
  const { data } = useQuery(ReadSchedulesDocument);

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
