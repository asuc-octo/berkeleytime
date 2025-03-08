import { createContext } from "react";

import { ISchedule } from "@/lib/api";

export interface ScheduleContextType {
  schedule: ISchedule;
  editing: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export default ScheduleContext;
