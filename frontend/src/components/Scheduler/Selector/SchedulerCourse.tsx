import BTLoader from 'components/Custom/Loader';
import {
  CourseOverviewFragment,
  useGetCourseForIdQuery,
} from '../../../graphql/graphql';
import React from 'react';
import { courseToColor, courseToName } from 'utils/courses/course';
import { Semester } from 'utils/playlists/semesters';

import { ReactComponent as Trash } from '../../../assets/svg/common/trash.svg';
import CourseCard from './CourseCard';
import { useScheduleContext } from '../ScheduleContext';

type Props = {
  courseId: string;

  /**
   * If you have (some) course info. Passing this
   * parameter will show the info you have so the
   * user seems something while waiting for the
   * whole component to load
   */
  partialCourse?: CourseOverviewFragment;

  semester: Semester;

  /**
   * If not passed, no delete button is shown.
   */
  didRemove?: () => void;
};

const SchedulerCourse = ({
  courseId,
  partialCourse,
  semester,
  didRemove,
}: Props) => {
  const { data, loading, error } = useGetCourseForIdQuery({
    variables: {
      id: courseId,
      year: semester.year,
      semester: semester.semester,
    },
  });

  const { schedule, setSchedule } = useScheduleContext();

  const color = courseToColor(courseId);

  return (
    <div className="scheduler-course">
      <div className="scheduler-course-header">
        <div
          className="scheduler-course-square"
          style={{ backgroundColor: color }}
        />
        <div className="scheduler-course-course">
          {partialCourse ? courseToName(partialCourse) : 'Loading...'}
        </div>
        {didRemove && (
          <div className="scheduler-course-remove" onClick={didRemove}>
            <Trash />
          </div>
        )}
      </div>
      {!data ? (
        <div className="scheduler-status">
          {loading ? (
            <BTLoader />
          ) : (
            "A critical error occured loading this course's data."
          )}
        </div>
      ) : (
        <CourseCard
          course={data.course!}
          color={color}
          schedule={schedule}
          setSchedule={setSchedule}
        />
      )}
    </div>
  );
};

export default SchedulerCourse;
