import React, { ComponentType, useState } from 'react';
import Welcome from 'components/Scheduler/Onboard/Welcome';
import SelectClasses from 'components/Scheduler/Onboard/SelectClasses';
import TimePreferences from 'components/Scheduler/Onboard/TimePreferences';

const pages: {
  key: string;
  component: ComponentType<{ updatePage: (i: number) => void }>;
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

const SchedulerOnboard = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const PageComponent = pages[pageIndex].component;

  return (
    <div className="onboard viewport-app">
      <PageComponent updatePage={setPageIndex}/>
    </div>
  );
};

export default SchedulerOnboard;
