import { useMemo } from "react";

import { Outlet, useNavigate, useParams } from "react-router-dom";

import ScheduleContext from "@/contexts/ScheduleContext";
import { useReadSchedule, useReadUser } from "@/hooks/api";
import { ScheduleIdentifier } from "@/lib/api";

export default function Schedule() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { data: user } = useReadUser();

  const { data: schedule } = useReadSchedule(scheduleId as ScheduleIdentifier, {
    onError: () => navigate("/schedules"),
  });

  const editing = useMemo(
    () => schedule?.createdBy === user?._id,
    [schedule, user]
  );

  // TODO: Recent schedules

  return schedule ? (
    <ScheduleContext value={{ schedule, editing }}>
      <Outlet />
    </ScheduleContext>
  ) : (
    <></>
  );
}
