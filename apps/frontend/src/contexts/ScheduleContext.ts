import { createContext } from "react";

import { ReadScheduleQuery, Schedule } from "@/lib/generated/graphql";

export interface ScheduleContextType {
  schedule: NonNullable<ReadScheduleQuery["schedule"]>;
  editing: boolean;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

export default ScheduleContext;
