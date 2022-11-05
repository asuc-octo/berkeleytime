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
import { getNodes } from 'utils/graphql';

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
    <div 
      className="scheduler-course"
      style={{ borderColor: color }}
    >
      <div className="scheduler-course-header">
        {/* Loading icon while course loads? */}
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

        <div className="header-text">
          <div className="scheduler-course-title">
            {partialCourse ? courseToName(partialCourse) : 'Loading...'}
          </div>

          <div className="scheduler-course-name">
            {partialCourse ? partialCourse.title : 'Loading...'}
          </div>

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

        {/* Different icon buttons? */}
        {didRemove && (
          <div
            className="scheduler-course-icon scheduler-course-remove"
            onClick={didRemove}
          >
            <Trash />
          </div>
        )}
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
          {/* Lectures */}
          <div className="scheduler-course-body">
            <div className="scheduler-course-category">
              <p className="scheduler-course-label">Lecture</p>

              {getNodes(data.course.sectionSet)
                .filter((section) => !section.disabled)
                .map((section, index) => (
                  <LectureCard
                    section={section}
                    course={data.course!}
                    sectionId={String(index + 1).padStart(3, '0')}
                    key={section.id}
                  />
                ))}
            </div>

            {/* Sections */}
            <div className="scheduler-course-category">
              <p className="scheduler-course-label">Discussion</p>
            </div>

            <div className="scheduler-course-category">
              <p className="scheduler-course-label">Laboratory</p>
            </div>
          </div>

          {/*<div>
            {getNodes(data.course.sectionSet)
              .filter((section) => !section.disabled)
              .map((section, index) => (
                <LectureCard
                  section={section}
                  course={data.course!}
                  color={color}
                  sectionId={String(index + 1).padStart(3, '0')}
                  key={section.id}
                />
              ))}
            </div>*/}
        </Collapse>
      )}
    </div>
  );
};

export default SchedulerCourse;
