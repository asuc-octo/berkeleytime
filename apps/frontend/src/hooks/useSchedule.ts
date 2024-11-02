import { useContext } from "react";

import ScheduleContext from "@/contexts/ScheduleContext";

const useSchedule = () => {
  const scheduleContext = useContext(ScheduleContext);

  if (!scheduleContext) {
    throw new Error(
      "useSchedule must be used within a ScheduleContext.Provider"
    );
  }

  return scheduleContext;
};

export default useSchedule;
