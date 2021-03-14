import React, { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import BTLoader from 'components/Common/BTLoader';
import CourseSearch from 'components/Scheduler/Onboard/CourseSearch';
import ProfileCard from 'components/Profile/ProfileCard';

import { ScheduleContext } from '../ScheduleContext';
import { CourseOverviewFragment } from '../../../graphql/graphql';
import { useUser } from '../../../graphql/hooks/user';
import { useGetCoursesForFilterQuery } from '../../../graphql/graphql';
import useLatestSemester from 'graphql/hooks/latestSemester';
import { addCourse } from './onboard';
import { compareDepartmentName } from 'utils/courses/sorting';
import { DEFAULT_SCHEDULE, Schedule, removeCourse } from 'utils/scheduler/scheduler';

type Props = {
  updatePage: (i: number) => void;
};

const SelectClasses = ({ updatePage }: Props) => {
  const { isLoggedIn, user, loading } = useUser();

  const savedClasses = ((user && user.savedClasses) || [])
    .filter((c): c is CourseOverviewFragment => c !== null)
    .sort(compareDepartmentName);

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
      <div className="scheduler__status">
        {error ? (
          'A critical error occured loading scheduler information.'
        ) : (
          <BTLoader />
        )}
      </div>
    );
  }

  // Get a list of all courses which will be used by the search bar.
  const allCourses = data.allCourses?.edges.map((e) => e?.node!)!;

  function trashCourse(courseId: string) {
    setSchedule(removeCourse(schedule, courseId));
  }

  return (
    <Container>
      <Row className="select-classes">
        <Col md={4} lg={4} xl={4}></Col>
        <Col md={4} lg={4} xl={4}>
          <div className="scheduler-heading">1. Select your classes</div>
          <div className="prompt">Search from the course catalog for the classes you’d like to include in your schedule.</div>
          <CourseSearch
            allCourses={allCourses}
            schedule={schedule}
            setSchedule={setSchedule}
          />
          <div className="profile-card-grid">
            {savedClasses.filter(course => schedule.courses.filter((e: CourseOverviewFragment) => e.id === course.id).length === 0).map((course) => (
              <div className="profile-card-row" key={course.id}>
                <Button
                  className="add-class"
                  variant="link"
                  onClick={() => addCourse(course, schedule, setSchedule)}
                >+</Button>
                <ProfileCard
                  removable={false}
                  course={course}
                  remove={() => trashCourse(course.id)}
                />
              </div>
            ))}
          </div>
        </Col>
        <Col md={4} lg={4} xl={4}>
          <div className="scheduler-heading">Selected classes</div>
          <div className="selected-classes">
            <ScheduleContext.Provider value={{ schedule, setSchedule }}>
              {schedule.courses.map((course: CourseOverviewFragment) => (
                <ProfileCard
                  key={course.id}
                  removable={true}
                  course={course}
                  remove={() => trashCourse(course.id)}
                />
              ))}
            </ScheduleContext.Provider>
          </div>
          <Button
            className="continue"
            onClick={() => updatePage(2)}
          >
            Continue
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SelectClasses;
