import BTSelect from 'components/Custom/Select';
import { CourseOverviewFragment } from 'graphql/graphql';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { courseToName } from 'utils/courses/course';
import { courseFilterOption } from 'utils/courses/search';
import { compareDepartmentName } from 'utils/courses/sorting';
import { Semester } from 'utils/playlists/semesters';
import {
  hasCourseById,
  removeCourse,
  Schedule,
  SchedulerCourseType,
} from 'utils/scheduler/scheduler';
import Callout from './Callout';
import SchedulerCourse from './Selector/SchedulerCourse';
import { ScheduleContext } from './ScheduleContext';

type CourseType = CourseOverviewFragment;

type CourseOptionType = {
  value: string;
  label: string;
  course: CourseType;
};

type Props = {
  allCourses: CourseType[];
  semester: Semester;
  schedule: Schedule;
  setSchedule: Dispatch<SetStateAction<Schedule>>;
};

const CourseSelector = ({
  allCourses,
  semester,
  schedule,
  setSchedule
}: Props) => {
  // Sort courses
  const sortedCourses: CourseOptionType[] = useMemo(
    () =>
      allCourses
        .sort(compareDepartmentName)
        .map((course) => ({
          value: course.id,
          label: courseToName(course),
          course,
        })),
    [allCourses]
  );

  function addCourse(course: SchedulerCourseType) {
    setSchedule({
      ...schedule,
      courses: [course, ...schedule.courses],
    });
  }

  function trashCourse(courseId: string) {
    setSchedule(removeCourse(schedule, courseId));
  }

  return (
    <div className="course-selector">
      <h2>Build Schedule</h2>
      <BTSelect
        isVirtual
        value={null}
        name="selectClass"
        placeholder="Choose a class..."
        options={sortedCourses.filter(
          (course) => !hasCourseById(schedule, course.value)
        )}
        filterOption={courseFilterOption}
        onChange={(c) => c && addCourse((c as CourseOptionType).course)}
      />
      <p>Choose the sections to build your schedule.</p>
      {schedule.courses.length > 0 && (<Callout
        message={
          <>
            You have <strong>≤20</strong> possible schedules remaining with the
            following course selections.
          </>
        }
      />)}
      <div>
        <ScheduleContext.Provider value={{ schedule, setSchedule }}>
          {schedule.courses.map((course) => (
            <SchedulerCourse
              key={course.id}
              courseId={course.id}
              partialCourse={course}
              semester={semester}
              didRemove={() => trashCourse(course.id)}
            />
          ))}
        </ScheduleContext.Provider>
      </div>
    </div>
  );
};

export default CourseSelector;
