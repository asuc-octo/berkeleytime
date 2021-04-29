import React from 'react';
import { Redirect, useParams } from 'react-router';
import { useUser } from 'graphql/hooks/user';
import RemoteScheduler from 'components/Scheduler/Editor/RemoteScheduler';
import LocalScheduler from 'components/Scheduler/Editor/LocalScheduler';

const Scheduler = () => {
  const { isLoggedIn, loading: userLoading } = useUser();

  const { scheduleId: scheduleUUID } = useParams<{ scheduleId?: string }>();
  const scheduleId = scheduleUUID && btoa(`ScheduleType:${scheduleUUID}`);

  // if you're not logged in, we'll go to the schedule preview
  if (!isLoggedIn && !userLoading && scheduleUUID) {
    return <Redirect to={`/s/${scheduleUUID}`} />;
  }

  return (
    <div className="scheduler viewport-app">
      {scheduleId ? (
        <RemoteScheduler scheduleId={scheduleId} />
      ) : (
        <LocalScheduler />
      )}
    </div>
  );
};

export default Scheduler;
