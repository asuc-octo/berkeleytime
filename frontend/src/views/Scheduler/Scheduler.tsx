import React, { ComponentType, useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Row } from 'react-bootstrap';
import BTLoader from 'components/Common/BTLoader';
import Welcome from 'components/Scheduler/BuildSchedule/Welcome';
import SelectClasses from 'components/Scheduler/BuildSchedule/SelectClasses';
import CourseSelector from 'components/Scheduler/CourseSelector';

import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import useLatestSemester from 'graphql/hooks/latestSemester';
import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import {
  addUnits,
  parseUnits,
  unitsToString,
  ZERO_UNITS,
} from 'utils/courses/units';

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
];

const Scheduler = () => {
  const [pageIndex, setPageIndex] = useState(0);

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

  const error = semesterError || coursesError;

  if (!data) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          {error ? (
            'A critical error occured loading scheduler information.'
          ) : (
            <BTLoader />
          )}
        </div>
      </div>
    );
  }

  // Get a list of all courses which will be used by the search bar.
  const allCourses = data.allCourses?.edges.map((e) => e?.node!)!;

  // Sum up the amount of units selected
  const selectedUnits = schedule.courses.reduce(
    (sum, course) =>
      course.units ? addUnits(sum, parseUnits(course.units)) : sum,
    ZERO_UNITS
  );

  const PageComponent = pages[pageIndex].component;

  return (
    <div className="scheduler viewport-app">
      <PageComponent updatePage={setPageIndex}/>

      {/* <Row noGutters>
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
            <div className="scheduler-units">
              Selected Units: {unitsToString(selectedUnits)}
            </div>
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
      </Row> */}
    </div>
  );
};

export default Scheduler;
