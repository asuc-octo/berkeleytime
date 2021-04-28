import BTSelect from 'components/Custom/Select';
import { CourseOverviewFragment } from 'graphql/graphql';
import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { courseToName } from 'utils/courses/course';
import { reactSelectCourseSearch } from 'utils/courses/search';
import { compareDepartmentName } from 'utils/courses/sorting';
import { Semester } from 'utils/playlists/semesters';
import {
  getUnitsForSchedule,
  hasCourseById,
  removeCourse,
  Schedule,
  SchedulerCourseType,
  SchedulerSectionType,
} from 'utils/scheduler/scheduler';
import Callout from './Callout';
import SchedulerCourse from './Selector/SchedulerCourse';
import { ScheduleContext } from './ScheduleContext';
import { unitsToString } from 'utils/courses/units';

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
  setSchedule: (newValue: Schedule) => void;

  /**
   * Pass this to add the ability to preview a section when a user
   * hovers over it.
   */
  setPreviewSection?: (newSection: SchedulerSectionType | null) => void;
};

const CourseSelector = ({
  allCourses,
  semester,
  schedule,
  setSchedule,
  setPreviewSection,
}: Props) => {
  // Sort courses
  const sortedCourses: CourseOptionType[] = useMemo(
    () =>
      allCourses.sort(compareDepartmentName).map((course) => ({
        value: course.id,
        label: courseToName(course),
        course,
      })),
    [allCourses]
  );

  function addCourse(course: SchedulerCourseType) {
    setSchedule({
      ...schedule,
      courses: [course, ...schedule.courses.filter((c) => c.id !== course.id)],
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
        filterOption={reactSelectCourseSearch}
        onChange={(c: CourseOptionType) => c && addCourse(c.course)}
      />
      <div className="scheduler-units">
        Scheduled Units: {unitsToString(getUnitsForSchedule(schedule))}
      </div>
      <div>
        <ScheduleContext.Provider
          value={{ schedule, setSchedule, setPreviewSection }}
        >
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
