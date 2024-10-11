import { Link } from "react-router-dom";

import { Container } from "@repo/theme";

import { useCreateSchedule } from "@/hooks/schedules/useCreateSchedule";
import { useDeleteSchedule } from "@/hooks/schedules/useDeleteSchedule";
import useSchedules from "@/hooks/schedules/useSchedules";
import { useUpdateSchedule } from "@/hooks/schedules/useUpdateSchedule";
import useUser from "@/hooks/useUser";
import { Semester } from "@/lib/api";

export default function Schedules() {
  const { data: user, loading: userLoading } = useUser();

  const { data: schedules, loading: schedulesLoading } = useSchedules({
    skip: !user,
  });

  const [deleteSchedule] = useDeleteSchedule();

  const [updateSchedule] = useUpdateSchedule();

  const [createSchedule] = useCreateSchedule();

  if (userLoading || schedulesLoading) return <></>;

  if (!user) return <></>;

  if (schedules) {
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
            <button onClick={() => deleteSchedule(schedule._id)}>
              Delete Schedule
            </button>
            <button
              onClick={() =>
                updateSchedule(schedule._id, {
                  name: "Updated",
                })
              }
            >
              Update Schedule
            </button>
          </div>
        ))}
      </Container>
    );
  }

  return <></>;
}
