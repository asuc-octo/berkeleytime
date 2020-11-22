import { CourseOverviewFragment } from 'graphql/graphql';
import React, { CSSProperties, memo, PureComponent, ReactNode } from 'react';
import { CourseSortAttribute } from 'utils/courses/sorting';
import { ReactComponent as BookmarkSaved } from '../../assets/svg/catalog/bookmark-saved.svg';
import { ReactComponent as BookmarkUnsaved } from '../../assets/svg/catalog/bookmark-unsaved.svg';

// TODO: consider importing utils after latest changes merged into master.
function formatEnrollmentPercentage(percentage: number): string {
  return `${Math.floor(percentage * 100)}% enrolled`;
}

function formatUnits(units: string): string {
  return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`
    .replace(/.0/g, '')
    .replace(/ - /, '-')
    .replace(/ or /g, '-');
}

function colorEnrollment(percentage: number): string {
  const pct = percentage * 100;
  if (pct < 33) {
    return 'enrollment-first-third';
  } else if (pct < 67) {
    return 'enrollment-second-third';
  } else {
    return 'enrollment-last-third';
  }
}

function colorGrade(grade: string): string {
  if (grade === '') {
    // console.error('colorGrade: no grade provided!');
    return '';
  }
  return `grade-${grade[0]}`;
}

function gradeSort(grade: string): ReactNode {
  return (
    <div className="filter-card-sort filter-card-grade">
      <h6 className={colorGrade(grade)}>{grade}</h6>
    </div>
  );
}

function openSeatsSort(open_seats: number): ReactNode {
  return (
    <div className="filter-card-sort filter-card-open-seats">
      <h6>{open_seats}</h6>
    </div>
  );
}

type FilterCardProps = {
  data: {
    courses: CourseOverviewFragment[];
    selectCourse: (course: CourseOverviewFragment) => void;
    sortBy: CourseSortAttribute;
    selectedCourse: CourseOverviewFragment | null;
  };
  index: number;
  style: CSSProperties;
};

const FilterCard = ({
  style,
  data,
  index
}: FilterCardProps) => {
  const course = data.courses[index];

  const { sortBy, selectedCourse } = data;
  const {
    abbreviation,
    courseNumber,
    title,
    letterAverage,
    enrolledPercentage,
    openSeats,
    units,
    id,
  } = course;

  let sort;
  switch (sortBy) {
    case 'department_name':
    case 'enrolled_percentage':
    case 'average_grade':
      if (letterAverage !== null) {
        sort = gradeSort(letterAverage);
      } else {
        sort = null;
      }
      break;
    case 'open_seats':
      sort = openSeatsSort(openSeats);
      break;
    default:
      sort = null;
  }

  const isSelectedCourse = id !== null && selectedCourse?.id === id;

  return (
    <div
      style={style}
      className="filter-card"
      onClick={() => data.selectCourse(course)}
    >
      <div
        className={`filter-card-container ${
          isSelectedCourse ? 'selected' : ''
        }`}
      >
        <div className="filter-card-info">
          <h6>{`${abbreviation} ${courseNumber}`}</h6>
          <p className="filter-card-info-desc">{title}</p>
          <div className="filter-card-info-stats">
            {enrolledPercentage === -1 ? (
              <p> N/A </p>
            ) : (
              <p className={colorEnrollment(enrolledPercentage)}>
                {formatEnrollmentPercentage(enrolledPercentage)}
              </p>
            )}

            <p>&nbsp;•&nbsp;{formatUnits(units)}</p>
          </div>
        </div>
        {sort}
      </div>
    </div>
  );
};

export default memo(FilterCard);
