import { createContext } from "react";

import { ISchedule } from "@/lib/api";

export interface ScheduleContextType {
  schedule: ISchedule;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export default ScheduleContext;
