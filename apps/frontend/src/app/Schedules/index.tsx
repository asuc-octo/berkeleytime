import { Link } from "react-router-dom";

import { Container } from "@repo/theme";

import { useCreateSchedule, useReadSchedules, useReadUser } from "@/hooks/api";
import { Semester } from "@/lib/api";

export default function Schedules() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const [createSchedule] = useCreateSchedule();

  if (userLoading || schedulesLoading) return <></>;

  if (!user) return <></>;

  if (!schedules) {
    return <></>;
  }

  return (
    <Container>
      <button
        onClick={() =>
          createSchedule({
            name: "Test",
            year: 2024,
            semester: Semester.Fall,
          })
        }
      >
        Create Schedule
      </button>
      {schedules?.map((schedule) => (
        <div key={schedule._id}>
          <Link to={schedule._id}>{schedule.name}</Link>
        </div>
      ))}
    </Container>
  );
}
