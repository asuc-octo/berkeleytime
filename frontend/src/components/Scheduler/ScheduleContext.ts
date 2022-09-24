import { createContext, useContext } from 'react';
import { Schedule, SchedulerSectionType } from 'utils/scheduler/scheduler';

type ContextType = {
  schedule: Schedule;
  setSchedule: (newSchedule: Schedule) => void;
  setPreviewSection?: (newPreviewSection: SchedulerSectionType | null) => void;
};

const ScheduleContext = createContext<ContextType>(
  (null as unknown) as ContextType
);

const useScheduleContext = () => useContext(ScheduleContext);

export { ScheduleContext, useScheduleContext };
