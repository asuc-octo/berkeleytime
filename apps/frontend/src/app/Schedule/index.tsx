import { useEffect, useMemo } from "react";

import { Outlet, useNavigate, useParams } from "react-router-dom";

import { Boundary, LoadingIndicator } from "@repo/theme";

import ScheduleContext from "@/contexts/ScheduleContext";
import { useReadSchedule, useReadUser } from "@/hooks/api";
import { ScheduleIdentifier } from "@/lib/api";

export default function Schedule() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { data: user } = useReadUser();

  const { data: schedule, loading } = useReadSchedule(
    scheduleId as ScheduleIdentifier
  );

  useEffect(() => {
    if (loading || schedule) return;

    navigate("/schedules");
  }, [loading, schedule, navigate]);

  const editing = useMemo(
    () => schedule?.createdBy === user?._id,
    [schedule, user]
  );

  // TODO: Recent schedules
  if (schedule) {
    return (
      <ScheduleContext value={{ schedule, editing }}>
        <Outlet />
      </ScheduleContext>
    );
  }

  return (
    <Boundary>
      <LoadingIndicator size="lg" />
    </Boundary>
  );
}
