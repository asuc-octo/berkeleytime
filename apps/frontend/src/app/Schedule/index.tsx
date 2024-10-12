import { useNavigate, useParams } from "react-router-dom";

import { useSchedule } from "@/hooks/schedules/useSchedule";
import { ScheduleIdentifier } from "@/lib/api";

import Manage from "./Manage";

export default function Schedule() {
  const { scheduleId } = useParams();

  const navigate = useNavigate();

  const { data: schedule } = useSchedule(scheduleId as ScheduleIdentifier, {
    onError: () => navigate("/schedules"),
  });

  return schedule ? <Manage schedule={schedule} /> : <></>;
}
