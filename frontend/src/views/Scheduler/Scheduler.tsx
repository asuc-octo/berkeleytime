import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';
import CourseCalendar from 'components/Scheduler/Calendar/CourseCalendar';

import { Semester } from 'utils/playlists/semesters';
import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import BTLoader from 'components/Custom/Loader';
import useLatestSemester from 'graphql/hooks/latestSemester';
import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';

const Scheduler = () => {
  const {
    semester: latestSemester,
    loading: semesterLoading,
    error: semesterError,
  } = useLatestSemester();

  const {
    data,
    loading: coursesLoading,
    error: coursesError,
  } = useGetCoursesForFilterQuery({
    variables: {
      playlists: latestSemester?.playlistId!,
    },
    skip: !latestSemester?.playlistId,
  });

  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);

  const loading = semesterLoading || coursesLoading;
  const error = semesterError || coursesError;

  if (loading) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          <BTLoader />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          A critical error occured loading scheduler information.
        </div>
      </div>
    );
  }

  const allCourses = data.allCourses?.edges.map((e) => e?.node!)!;

  return (
    <div className="scheduler viewport-app">
      <Row noGutters>
        <Col md={4} lg={4} xl={4}>
          <CourseSelector
            allCourses={allCourses}
            semester={latestSemester!}
            schedule={schedule}
            setSchedule={setSchedule}
          />
        </Col>
        <Col>
          <SchedulerCalendar schedule={schedule} />
        </Col>
      </Row>
    </div>
  );
};

export default Scheduler;
