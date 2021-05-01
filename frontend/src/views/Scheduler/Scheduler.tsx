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

const Scheduler = () => {
  const { isLoggedIn, loading: userLoading } = useUser();
  const {
    semester: latestSemester,
    error: semesterError,
  } = useLatestSemester();

  // Only load the list of filters once we have the latest semester. If we
  // didn't wait, we'd load all semesters' classes which is way to many.
  const { data, error: coursesError } = useGetCoursesForFilterQuery({
    variables: {
      playlists: latestSemester?.playlistId!,
    },
    skip: !latestSemester?.playlistId,
  });

  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [onboarding, setOnboarding] = useState(true);
  const { scheduleId: scheduleUUID } = useParams<{ scheduleId?: string }>();
  const scheduleId = scheduleUUID && btoa(`ScheduleType:${scheduleUUID}`);

  const history = useHistory();

  if (!data || userLoading) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          {semesterError || coursesError ? (
            'An error occured loading scheduler information. Please try again later.'
          ) : (
            <BTLoader />
          )}
        </div>
      </div>
    );
  }

  // if you're not logged in, we'll go to the schedule preview
  if (!isLoggedIn && scheduleUUID) {
    return <Redirect to={`/s/${scheduleUUID}`} />;
  }

  function setScheduleId(newScheduleId: string) {
    const scheduleUUID = atob(newScheduleId).split(':')[1];

    // Defer this to the next tick
    setTimeout(() => {
      history.push(`/scheduler/${scheduleUUID}`);
    });
  }

  const allCourses = getNodes(data.allCourses!);

  async function createSchedule() {
    setOnboarding(false);
  }

  return (
    <div className="scheduler viewport-app">
      {(onboarding && !scheduleId) ?
      <SchedulerOnboard
        schedule={schedule}
        setSchedule={setSchedule}
        createSchedule={createSchedule}
      /> :
      <ScheduleEditor
        scheduleId={scheduleId ?? null}
        setScheduleId={setScheduleId}
        allCourses={allCourses}
        semester={latestSemester!}
        schedule={schedule}
        setRawSchedule={setSchedule}
      />}
    </div>
  );
};

export default Scheduler;
