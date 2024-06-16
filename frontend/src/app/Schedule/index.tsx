import { useState } from "react";

import { useQuery } from "@apollo/client";
import { Outlet } from "react-router";
import { useNavigate, useParams } from "react-router-dom";

import Boundary from "@/components/Boundary";
import LoadingIndicator from "@/components/LoadingIndicator";
import { GET_SCHEDULE, GetScheduleResponse, IClass, ISection } from "@/lib/api";

import { ScheduleContextType } from "./schedule";

export default function Schedule() {
  const { scheduleId } = useParams();

  const navigate = useNavigate();

  const { data } = useQuery<GetScheduleResponse>(GET_SCHEDULE, {
    onError: () => navigate("/schedules"),
    variables: { id: scheduleId },
  });

  const [selectedSections, setSelectedSections] = useState<ISection[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [expanded, setExpanded] = useState<boolean[]>([]);

  return data ? (
    <Outlet
      context={
        {
          selectedSections,
          setSelectedSections,
          classes,
          setClasses,
          expanded,
          setExpanded,
        } satisfies ScheduleContextType
      }
    />
  ) : (
    <Boundary>
      <LoadingIndicator size={32} />
    </Boundary>
  );
}
