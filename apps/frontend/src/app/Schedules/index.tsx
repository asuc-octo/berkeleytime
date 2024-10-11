import { Link } from "react-router-dom";

import Container from "@/components/Container";
import useSchedules from "@/hooks/useSchedules";
import useUser from "@/hooks/useUser";

export default function Schedules() {
  const { data: user, loading: userLoading } = useUser();

  const { data: schedules, loading: schedulesLoading } = useSchedules({
    skip: !user,
  });

  if (userLoading || schedulesLoading) return <></>;

  if (!user) return <></>;

  if (schedules) {
    return (
      <Container>
        {schedules?.map((schedule) => (
          <Link to={schedule._id} key={schedule._id}>
            {schedule.name}
          </Link>
        ))}
      </Container>
    );
  }

  return <></>;
}
