import React from 'react';
import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import useLatestSemester from 'graphql/hooks/latestSemester';
import ScheduleEditor from 'components/Scheduler/ScheduleEditor';
import { useHistory, useParams } from 'react-router';
import { getNodes } from 'utils/graphql';

const Scheduler = () => {
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

  const { scheduleId } = useParams<{ scheduleId?: string }>();

  const history = useHistory();

  const error = semesterError || coursesError;

  if (!data) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          {error ? (
            'An error occured loading scheduler information. Please try again later.'
          ) : (
            <BTLoader />
          )}
        </div>
      </div>
    );
  }

  function setScheduleId(newScheduleId: string) {
    history.push(`/scheduler/${newScheduleId}`);
  }

  const allCourses = getNodes(data.allCourses!);

  return (
    <div className="scheduler viewport-app">
      <ScheduleEditor
        scheduleId={scheduleId ?? null}
        setScheduleId={setScheduleId}
        allCourses={allCourses}
        semester={latestSemester!}
      />
    </div>
  );
};

export default Scheduler;
