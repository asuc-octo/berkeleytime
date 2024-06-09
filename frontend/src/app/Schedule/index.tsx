import { useState } from "react";

import { Outlet } from "react-router";

import { IClass, ISection } from "@/lib/api";

import { ScheduleContextType } from "./schedule";

export default function Schedule() {
  const [selectedSections, setSelectedSections] = useState<ISection[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [expanded, setExpanded] = useState<boolean[]>([]);

  return (
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
  );
}
