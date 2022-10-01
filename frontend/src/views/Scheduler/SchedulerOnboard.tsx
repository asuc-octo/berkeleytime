import React, {
  ComponentType,
  useState,
  Dispatch,
  SetStateAction,
  useSelector
} from 'react';
import Welcome from 'components/Scheduler/Onboard/Welcome';
import SelectClasses from 'components/Scheduler/Onboard/SelectClasses';

import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import { ReduxState } from 'redux/store';

const pages: {
  key: string;
  component: ComponentType<{
    updatePage: (i: number) => void;
    schedule: Schedule;
    setSchedule: Dispatch<SetStateAction<Schedule>>;
  }>;
}[] = [
  {
    key: 'welcome',
    component: Welcome,
  },
  {
    key: 'select-classes',
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
  
  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  if (isMobile) {
    return (
      <div className="scheduler viewport-app">
        <div className="onboard">
          <p className="py-5 px-2 mobile">Unfortunately, the Scheduler does not support mobile devices at this time.</p>
        </div>
      </div>
    );
  }

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
