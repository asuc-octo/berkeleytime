import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { Schedule } from 'utils/scheduler/scheduler';

type ContextType = {
  schedule: Schedule;
  setSchedule: (newSchedule: Schedule) => void;
};

const ScheduleContext = createContext<ContextType>(
  (null as unknown) as ContextType
);

const useScheduleContext = () => useContext(ScheduleContext);

export { ScheduleContext, useScheduleContext };
