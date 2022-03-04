import BTSelect from "components/Custom/Select";
import { CourseOverviewFragment } from "graphql/graphql";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import { courseToName } from "utils/courses/course";
import { reactSelectCourseSearch } from "utils/courses/search";
import { compareDepartmentName } from "utils/courses/sorting";
import { hasCourseById, Schedule } from "utils/scheduler/scheduler";
import { addCourse } from "./onboard";

type CourseType = CourseOverviewFragment;

type CourseOptionType = {
  value: string;
  label: string;
  course: CourseType;
};

type Props = {
  allCourses: CourseType[];
  schedule: Schedule;
  setSchedule: Dispatch<SetStateAction<Schedule>>;
};

const CourseSelector = ({ allCourses, schedule, setSchedule }: Props) => {
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

  return (
    <div className="course-selector">
      <BTSelect
        isVirtual
        value={null}
        name="selectClass"
        placeholder="Search for a class..."
        options={sortedCourses.filter(
          (course) => !hasCourseById(schedule, course.value)
        )}
        filterOption={reactSelectCourseSearch}
        onChange={(c: CourseOptionType) =>
          c && addCourse(c.course, schedule, setSchedule)
        }
      />
    </div>
  );
};

export default CourseSelector;
