import BTSelect from 'components/Custom/Select';
import { CourseOverviewFragment } from 'graphql/graphql';
import React, { useMemo, useState } from 'react';
import { courseToName } from 'utils/courses/course';
import { courseFilterOption, SearchableCourse } from 'utils/courses/search';
import { compareDepartmentName, SortableCourse } from 'utils/courses/sorting';
import { Semester } from 'utils/playlists/semesters';
import Callout from './Callout';
import SchedulerCourse from './SchedulerCourse';

type CourseType = CourseOverviewFragment;

type CourseOptionType = {
  value: string;
  label: string;
  course: CourseType;
};

type Props = {
  allCourses: CourseType[];
  semester: Semester;
};

const CourseSelector = ({
  allCourses,
  semester
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
    setSelectedCourses((oldCourses) => [course, ...oldCourses]);
  }

  function removeCourse(course: SortableCourse) {
    setSelectedCourses((oldCourses) => oldCourses.filter(c => c !== course));
  }

  return (
    <div className="course-selector">
      <h2>Build Schedule</h2>
      <BTSelect
        isVirtual
        value={null}
        name="selectClass"
        placeholder="Choose a class..."
        options={sortedCourses}
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
