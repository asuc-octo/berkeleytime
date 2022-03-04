import BTLoader from "components/Common/BTLoader";
import CourseSearch from "components/Scheduler/Onboard/CourseSearch";
import SchedulerCourseCard from "components/Scheduler/Onboard/SchedulerCourseCard";
import useLatestSemester from "graphql/hooks/latestSemester";
import React, { Dispatch, SetStateAction } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { compareDepartmentName } from "utils/courses/sorting";
import { Schedule, removeCourse } from "utils/scheduler/scheduler";

import { CourseOverviewFragment } from "../../../graphql/graphql";
import { useGetCoursesForFilterQuery } from "../../../graphql/graphql";
import { useUser } from "../../../graphql/hooks/user";
import { ScheduleContext } from "../ScheduleContext";
import { addCourse } from "./onboard";

type Props = {
  // updatePage: (i: number) => void;
  schedule: Schedule;
  setSchedule: Dispatch<SetStateAction<Schedule>>;
};

const SelectClasses = ({ schedule, setSchedule }: Props) => {
  const { isLoggedIn, user, loading } = useUser();

  const savedClasses = ((user && user.savedClasses) || [])
    .filter((c): c is CourseOverviewFragment => c !== null)
    .sort(compareDepartmentName);

  const { semester: latestSemester, error: semesterError } =
    useLatestSemester();

  // Only load the list of filters once we have the latest semester. If we
  // didn't wait, we'd load all semesters' classes which is way to many.
  const { data, error: coursesError } = useGetCoursesForFilterQuery({
    variables: {
      playlists: latestSemester?.playlistId!,
    },
    skip: !latestSemester?.playlistId,
  });

  const error = semesterError || coursesError;

  if (!data) {
    return (
      <div className="scheduler__status">
        {error ? (
          "A critical error occured loading scheduler information."
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
          <div className="prompt">
            Search from the course catalog for the classes you’d like to include
            in your schedule.
          </div>
          <CourseSearch
            allCourses={allCourses}
            schedule={schedule}
            setSchedule={setSchedule}
          />
          <div className="profile-card-grid">
            {savedClasses
              .filter(
                (course) =>
                  schedule.courses.filter(
                    (e: CourseOverviewFragment) => e.id === course.id
                  ).length === 0
              )
              .map((course) => (
                <div className="profile-card-row" key={course.id}>
                  <Button
                    className="add-class"
                    variant="link"
                    onClick={() => addCourse(course, schedule, setSchedule)}
                  >
                    +
                  </Button>
                  <SchedulerCourseCard
                    key={course.id}
                    course={course}
                    removable={false}
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
                <SchedulerCourseCard
                  key={course.id}
                  course={course}
                  removable={true}
                  remove={() => trashCourse(course.id)}
                />
              ))}
            </ScheduleContext.Provider>
          </div>
          <Button className="continue">Continue</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SelectClasses;
