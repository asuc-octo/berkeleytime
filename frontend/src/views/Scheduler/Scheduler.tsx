import React, { useState } from 'react';
import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import useLatestSemester from 'graphql/hooks/latestSemester';
import { DEFAULT_SCHEDULE, Schedule, serializeSchedule } from 'utils/scheduler/scheduler';
import SchedulerOnboard from './SchedulerOnboard';
import ScheduleEditor from 'components/Scheduler/ScheduleEditor';
import { Redirect, useHistory, useParams } from 'react-router';
import { getNodes } from 'utils/graphql';
import { useUser } from 'graphql/hooks/user';
import RemoteScheduler from 'components/Scheduler/Editor/RemoteScheduler';
import LocalScheduler from 'components/Scheduler/Editor/LocalScheduler';

const Scheduler = () => {
  const { isLoggedIn, loading: userLoading } = useUser();
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [onboarding, setOnboarding] = useState(true);
  const { scheduleId: scheduleUUID } = useParams<{ scheduleId?: string }>();
  const scheduleId = scheduleUUID && btoa(`ScheduleType:${scheduleUUID}`);

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

  async function createSchedule() {
    setOnboarding(false);
  }

  return (
    <div className="scheduler viewport-app">
      {(onboarding && !scheduleId) ? (
        <SchedulerOnboard
          schedule={schedule}
          setSchedule={setSchedule}
          createSchedule={createSchedule}
        />) : scheduleId ? (
        <RemoteScheduler
          scheduleId={scheduleId}
          schedule={schedule}
          setRawSchedule={setSchedule}
        />) : (
        <LocalScheduler
          schedule={schedule}
          setSchedule={setSchedule}
        />
      )}
    </div>
  );
};

export default Scheduler;
