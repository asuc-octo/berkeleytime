import React, { useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';

import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import useLatestSemester from 'graphql/hooks/latestSemester';
import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import { useLocalStorageState } from 'utils/hooks';

const SCHEDULER_KEY = 'SCHEDULER:DEFAULT';

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

  const [schedule, setSchedule] = useLocalStorageState<Schedule>(
    SCHEDULER_KEY,
    DEFAULT_SCHEDULE
  );

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

  // Get a list of all courses which will be used by the search bar.
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
          <div className="scheduler-header">
            <ButtonToolbar>
              <ButtonGroup className="mr-3">
                <Button className="bt-btn-primary" size="sm">
                  Save
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button className="bt-btn-inverted" size="sm">
                  Export to Google Calendar
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </div>
          <SchedulerCalendar schedule={schedule} />
        </Col>
      </Row>
    </div>
  );
};

export default Scheduler;
