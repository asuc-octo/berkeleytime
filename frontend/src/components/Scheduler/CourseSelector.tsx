import BTSelect from 'components/Custom/Select';
import { CourseOverviewFragment } from 'graphql/graphql';
import React, { useMemo, useState } from 'react';
import { courseToName } from 'utils/courses/course';
import { courseFilterOption } from 'utils/courses/search';
import { compareDepartmentName, SortableCourse } from 'utils/courses/sorting';
import { Semester } from 'utils/playlists/semesters';
import { Schedule } from 'utils/scheduler/scheduler';
import Callout from './Callout';
import SchedulerCourse from './Selector/SchedulerCourse';

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
  setSchedule: (schedule: Schedule) => void;
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

  const [selectedCourses, setSelectedCourses] = useState<CourseType[]>([]);

  function addCourse(course: SortableCourse) {
    setSchedule({
      ...schedule,
      courseIds: [course.id, ...schedule.courseIds]
    });
  }

  function removeCourse(course: SortableCourse) {
    setSchedule({
      ...schedule,
      courseIds: schedule.courseIds.filter(c => c !== course),
    });
  }

  return (
    <div className="course-selector">
      <h2>Build Schedule</h2>
      <BTSelect
        isVirtual
        value={null}
        name="selectClass"
        placeholder="Choose a class..."
        options={sortedCourses.filter((course) =>
          !schedule.courseIds.includes(course.value)
        )}
        filterOption={courseFilterOption}
        onChange={(c) => c && addCourse((c as CourseOptionType).course)}
      />
      <p>Choose the sections to build your schedule.</p>
      <Callout
        message={
          <>
            You have <strong>≤20</strong> possible schedules remaining with the
            following course selections.
          </>
        }
      />
      <div>
        {selectedCourses.map((course) => (
          <SchedulerCourse
            key={course.id}
            course={course}
            semester={semester}
            didRemove={() => removeCourse(course)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseSelector;
