import React, {
  ComponentType,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import Welcome from "components/Scheduler/Onboard/Welcome";
import SelectClasses from "components/Scheduler/Onboard/SelectClasses";

import { DEFAULT_SCHEDULE, Schedule } from "utils/scheduler/scheduler";

const pages: {
  key: string;
  component: ComponentType<{
    updatePage: (i: number) => void;
    schedule: Schedule;
    setSchedule: Dispatch<SetStateAction<Schedule>>;
  }>;
}[] = [
  {
    key: "welcome",
    component: Welcome,
  },
  {
    key: "select-classes",
    component: SelectClasses,
  },
  // {
  //   key: 'time-preferences',
  //   component: TimePreferences,
  // },
];

const SchedulerOnboard = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const PageComponent = pages[pageIndex].component;

  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);

  return (
    <div className="scheduler viewport-app">
      <div className="onboard">
        <PageComponent
          updatePage={setPageIndex}
          schedule={schedule}
          setSchedule={setSchedule}
        />
      </div>
    </div>
  );
};

export default SchedulerOnboard;
