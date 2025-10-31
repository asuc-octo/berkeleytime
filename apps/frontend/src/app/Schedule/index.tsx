import { useEffect, useMemo } from "react";

import { Outlet, useNavigate, useParams } from "react-router-dom";

import { Boundary, Color, LoadingIndicator } from "@repo/theme";

import ScheduleContext from "@/contexts/ScheduleContext";
import { useReadSchedule, useReadUser } from "@/hooks/api";
import { ISchedule, ScheduleIdentifier } from "@/lib/api";

import { acceptedColors, getNextClassColor } from "./schedule";

export default function Schedule() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { data: user } = useReadUser();

  const { data: scheduleData, loading } = useReadSchedule(
    scheduleId as ScheduleIdentifier
  );

  const schedule: ISchedule | undefined = useMemo(() => {
    if (!scheduleData) return undefined;
    return {
      ...scheduleData,
      classes: scheduleData.classes.map((cls, i) => {
        return {
          ...cls,
          color: cls.color ?? getNextClassColor(i),
        };
      }),
      events: scheduleData.events.map((ev) => {
        return {
          ...ev,
          color: ev.color ?? Color.gray,
        };
      }),
    };
  }, [scheduleData]);

  useEffect(() => {
    if (loading || schedule) return;

    navigate("/schedules", { replace: true });
  }, [loading, navigate, schedule]);

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
