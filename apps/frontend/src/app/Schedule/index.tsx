import { Outlet, useNavigate, useParams } from "react-router-dom";

import ScheduleContext from "@/contexts/ScheduleContext";
import { useReadSchedule } from "@/hooks/api";
import { ScheduleIdentifier } from "@/lib/api";

export default function Schedule() {
  const { scheduleId } = useParams();

  const navigate = useNavigate();

  const { data: schedule } = useReadSchedule(scheduleId as ScheduleIdentifier, {
    onError: () => navigate("/schedules"),
  });

  return schedule ? (
    <ScheduleContext value={{ schedule }}>
      <Outlet />
    </ScheduleContext>
  ) : (
    <></>
  );
}
