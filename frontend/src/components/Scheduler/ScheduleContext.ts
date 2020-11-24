import { createContext, Dispatch, useContext } from 'react';
import { Schedule } from 'utils/scheduler/scheduler';

type ContextType = {
  schedule: Schedule;
  setSchedule: Dispatch<Schedule>;
};

const ScheduleContext = createContext<ContextType>((null as unknown) as ContextType);

const useScheduleContext = () => useContext(ScheduleContext);

export { ScheduleContext, useScheduleContext };
