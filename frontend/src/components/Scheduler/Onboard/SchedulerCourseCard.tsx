import React from "react";
import { Link } from "react-router-dom";

import { CourseOverviewFragment } from "../../../graphql/graphql";
import {
  formatUnits,
  applyIndicatorPercent,
  applyIndicatorGrade,
} from "../../../utils/utils";
import ProfileCard from "./../../Profile/ProfileCard";

type Props = {
  course: CourseOverviewFragment;
  removable: boolean;
  remove?: () => void;
};

const SchedulerCourseCard = ({ course, removable, remove }: Props) => {
  return (
    <ProfileCard
      component={Link}
      to={`/scheduler`}
      title={`${course.abbreviation} ${course.courseNumber}`}
      subtitle={course.title}
      description={
        <>
          {course.enrolledPercentage !== -1 && (
            <span>
              {applyIndicatorPercent(
                `${course.enrolled}/${course.enrolledMax} enrolled`,
                course.enrolledPercentage
              )}
              &nbsp;•&nbsp;
            </span>
          )}
          <span>{formatUnits(course.units)}</span>
        </>
      }
      aside={
        course.letterAverage && (
          <div className="profile-card-sort profile-card-grade">
            {applyIndicatorGrade(course.letterAverage, course.letterAverage)}
          </div>
        )
      }
      removable={removable}
      didRemove={remove}
    />
  );
};

export default SchedulerCourseCard;
