import BTLoader from 'components/Custom/Loader';
import {
  CourseOverviewFragment,
  useGetCourseForIdQuery,
} from '../../graphql/graphql';
import React from 'react';
import { courseToColor, courseToName } from 'utils/courses/course';
import { Semester } from 'utils/playlists/semesters';

import { ReactComponent as Trash } from '../../assets/svg/common/trash.svg';
import CourseCard from './CourseCard';

type Props = {
  course: CourseOverviewFragment;
  semester: Semester;
  didRemove?: () => void;
};

const SchedulerCourse = ({ course, semester, didRemove }: Props) => {
  const { data, loading, error } = useGetCourseForIdQuery({
    variables: {
      id: course.id,
      year: semester.year,
      semester: semester.semester,
    },
  });

  const color = courseToColor(course);

  return (
    <div className="scheduler-course">
      <div className="scheduler-course-header">
        <div
          className="scheduler-course-square"
          style={{ backgroundColor: color }}
        />
        <div className="scheduler-course-course">{courseToName(course)}</div>
        {didRemove && (
          <div className="scheduler-course-remove" onClick={didRemove}>
            <Trash />
          </div>
        )}
      </div>
      {!data ? (
        <div className="scheduler-status">
          {loading ? <BTLoader /> : "A critical error occured loading this course's data."}
        </div>
      ) : (
        <CourseCard course={data.course!} color={color} />
      )}
    </div>
  );
};

export default SchedulerCourse;
