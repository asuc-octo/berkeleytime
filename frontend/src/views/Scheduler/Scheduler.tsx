import React from 'react';
import BTLoader from 'components/Common/BTLoader';
import SchedulerOnboard from './SchedulerOnboard';
import { useUser } from 'graphql/hooks/user';

const Scheduler = () => {
  const { width, setWidth } = React.useState(document.body.clientWidth);

  const updateWidth: Function = () => setWidth(document.body.clientWidth);

  React.useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  });

  if (width < 786) {
    return (
      <h1>Mobile</h1>
    )
  }

  const { loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          <BTLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="scheduler viewport-app">
      <SchedulerOnboard />
    </div>
  );
};

export default Scheduler;
