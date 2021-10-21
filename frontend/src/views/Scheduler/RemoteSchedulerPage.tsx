import BTLoader from 'components/Common/BTLoader';
import { useUser } from 'graphql/hooks/user';
import React, { useState } from 'react';
import { Redirect, useParams } from 'react-router';
import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import RemoteScheduler from '../../components/Scheduler/Editor/RemoteScheduler';

const RemoteSchedule = () => {
  const { isLoggedIn, loading: userLoading } = useUser();
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [onboarding, setOnboarding] = useState(true);
  const { scheduleId: scheduleUUID } = useParams<{ scheduleId: string }>();
  const scheduleId = btoa(`ScheduleType:${scheduleUUID}`);

  if (userLoading) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          <BTLoader />
        </div>
      </div>
    );
  }

  // if you're not logged in, we'll go to the schedule preview
  if (!isLoggedIn && !userLoading && scheduleUUID) {
    return <Redirect to={`/s/${scheduleUUID}`} />;
  }

  return (
    <div className="scheduler viewport-app">
      <RemoteScheduler
        scheduleId={scheduleId}
        schedule={schedule}
        setRawSchedule={setSchedule}
      />
    </div>
  );
};

export default RemoteScheduler;
