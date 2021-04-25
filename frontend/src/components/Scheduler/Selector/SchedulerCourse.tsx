import {
  CourseOverviewFragment,
  useGetSchedulerCourseForIdQuery,
} from '../../../graphql/graphql';
import React, { useState } from 'react';
import { courseToName } from 'utils/courses/course';
import { Semester } from 'utils/playlists/semesters';

import { ReactComponent as Trash } from '../../../assets/svg/common/trash.svg';
import LectureCard from './LectureCard';
import BTLoader from '../../Common/BTLoader';
import { applyIndicatorPercent } from 'utils/utils';
import { parseUnits, unitsToString } from 'utils/courses/units';

import { ReactComponent as ExpandMore } from '../../../assets/svg/common/expand.svg';
import { Collapse } from 'react-bootstrap';
import { getColorForCourse } from 'utils/scheduler/scheduler';
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
  const { data, loading } = useGetSchedulerCourseForIdQuery({
    variables: {
      id: courseId,
      year: semester.year,
      semester: semester.semester,
    },
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const { schedule } = useScheduleContext();

  const color = getColorForCourse(schedule, courseId);

  return (
    <div className="scheduler-course">
      <div className="scheduler-course-header">
        <div
          className="scheduler-course-square"
          style={{ backgroundColor: color }}
        />
        <div className="scheduler-course-title">
          {partialCourse ? courseToName(partialCourse) : 'Loading...'}
        </div>

        {didRemove && (
          <div
            className="scheduler-course-icon scheduler-course-remove"
            onClick={didRemove}
          >
            <Trash />
          </div>
        )}
      </div>
      <div className="scheduler-course-header">
        <div className="scheduler-course-name">
          {partialCourse ? partialCourse.title : 'Loading...'}
        </div>
        {data && (
          <div
            className="scheduler-course-icon scheduler-course-expand"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ExpandMore
              style={{
                transform: isExpanded ? 'rotate(-180deg)' : '',
              }}
            />
          </div>
        )}
      </div>
      <div className="scheduler-course-header">
        <div className="scheduler-course-name">
          {!data?.course ? (
            'Loading...'
          ) : (
            <>
              {data.course.enrolled !== -1 && (
                <>
                  {applyIndicatorPercent(
                    `${data.course.enrolled}/${data.course.enrolledMax} enrolled`,
                    data.course.enrolled / data.course.enrolledMax
                  )}{' '}
                  &bull;{' '}
                </>
              )}
              {data.course.units &&
                `${unitsToString(parseUnits(data.course.units))} units`}
            </>
          )}
        </div>
      </div>
      {!data?.course ? (
        <div className="scheduler-status">
          {loading ? (
            <BTLoader />
          ) : (
            "A critical error occured loading this course's data."
          )}
        </div>
      ) : (
        <Collapse in={isExpanded}>
          <div>
            {data.course.sectionSet.edges
              .map((e) => e?.node!)
              .map((section, index) => (
                <LectureCard
                  section={section}
                  course={data.course!}
                  color={color}
                  sectionId={String(index + 1).padStart(3, '0')}
                  key={section.id}
                />
              ))}
          </div>
        </Collapse>
      )}
    </div>
  );
};

export default SchedulerCourse;
