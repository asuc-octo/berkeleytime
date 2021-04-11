import React, { ComponentType, useState, Dispatch, SetStateAction } from 'react';
import Welcome from 'components/Scheduler/Onboard/Welcome';
import SelectClasses from 'components/Scheduler/Onboard/SelectClasses';
import TimePreferences from 'components/Scheduler/Onboard/TimePreferences';

import { Schedule } from 'utils/scheduler/scheduler';

const pages: {
  key: string;
  component: ComponentType<{
    updatePage: (i: number) => void,
    schedule: Schedule,
    setSchedule: Dispatch<SetStateAction<Schedule>>,
    createSchedule: () => void,
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
  {
    key: 'time-preferences',
    component: TimePreferences,
  },
];

type Props = {
  schedule: Schedule;
  setSchedule: Dispatch<SetStateAction<Schedule>>;
  createSchedule: () => void;
};

const SchedulerOnboard = ({schedule, setSchedule, createSchedule}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const PageComponent = pages[pageIndex].component;

  return (
    <div className="onboard">
      <PageComponent
        updatePage={setPageIndex}
        schedule={schedule}
        setSchedule={setSchedule}
        createSchedule={createSchedule}
      />
    </div>
  );
};

export default SchedulerOnboard;
