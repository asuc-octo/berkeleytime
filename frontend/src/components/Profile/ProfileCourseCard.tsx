import React from 'react';
import {
  formatUnits,
  formatPercentage,
  applyIndicatorPercent,
  applyIndicatorGrade,
} from '../../utils/utils';
import { CourseOverviewFragment } from '../../graphql/graphql';
import { useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { Link } from 'react-router-dom';
import TrashButton from 'components/Common/TrashButton';

type Props = {
  course: CourseOverviewFragment;
  removable: boolean;
};

const ProfileCourseCard = ({ course, removable }: Props) => {
  const unsaveCourse = useUnsaveCourse();

  return (
    <Link
      className="profile-card"
      to={`/catalog/${course.abbreviation}/${course.courseNumber}`}
    >
      <div className="profile-card-info">
        <h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
        <p className="profile-card-info-desc">{course.title}</p>
        <div className="profile-card-info-stats">
          {course.enrolledPercentage === -1
            ? null
            : applyIndicatorPercent(
                `${course.enrolled}/${course.enrolledMax} enrolled`,
                course.enrolledPercentage
              )}

          <span>&nbsp;•&nbsp;{formatUnits(course.units)}</span>
        </div>
      </div>
      {course.letterAverage && (
        <div className="profile-card-sort profile-card-grade">
          {applyIndicatorGrade(course.letterAverage, course.letterAverage)}
        </div>
      )}
      {removable && (
        <TrashButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            unsaveCourse(course);
          }}
        />
      )}
    </Link>
  );
};

export default ProfileCourseCard;
