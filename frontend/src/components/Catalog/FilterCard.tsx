import { CourseOverviewFragment } from 'graphql/graphql';
import { useSaveCourse, useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { useUser } from 'graphql/hooks/user';
import React, { CSSProperties, memo, ReactNode } from 'react';
import { CourseReference, isSameCourse } from 'utils/courses/course';
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
      <div className={colorGrade(grade)}>{grade}</div>
    </div>
  );
}

function openSeatsSort(open_seats: number): ReactNode {
  return (
    <div className="filter-card-sort filter-card-open-seats">
      <div>{open_seats}</div>
    </div>
  );
}

type FilterCardProps = {
  data: {
    courses: CourseOverviewFragment[];
    selectCourse: (course: CourseOverviewFragment) => void;
    sortBy: CourseSortAttribute;
    selectedCourse: CourseReference | null;
  };
  index: number;
  style: CSSProperties;
};

const FilterCard = ({ style, data, index }: FilterCardProps) => {
  const course = data.courses[index];

  const { user } = useUser();
  const saveCourse = useSaveCourse();
  const unsaveCourse = useUnsaveCourse();

  const { sortBy, selectedCourse } = data;

  let sort;
  switch (sortBy) {
    case 'department_name':
    case 'enrolled_percentage':
    case 'average_grade':
      if (course.letterAverage !== null) {
        sort = gradeSort(course.letterAverage);
      } else {
        sort = null;
      }
      break;
    case 'open_seats':
      sort = openSeatsSort(course.openSeats);
      break;
    default:
      sort = null;
  }

  const isSelectedCourse = isSameCourse(selectedCourse, course);
  const isSaved = user?.savedClasses?.some(
    (savedCourse) => savedCourse?.id === course.id
  );

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
          <h6>{`${course.abbreviation} ${course.courseNumber}`}</h6>
          <p className="filter-card-info-desc">{course.title}</p>
          <div className="filter-card-info-stats">
            {course.enrolledPercentage === -1 ? (
              <p> N/A </p>
            ) : (
              <p className={colorEnrollment(course.enrolledPercentage)}>
                {formatEnrollmentPercentage(course.enrolledPercentage)}
              </p>
            )}

            <p>
              &nbsp;•&nbsp;{course.units ? formatUnits(course.units) : 'N/A'}
            </p>
          </div>
        </div>
        {sort}
        {user && (
          <div
            className="filter-card-save"
            onClick={
              isSaved ? () => unsaveCourse(course) : () => saveCourse(course)
            }
          >
            {isSaved ? <BookmarkSaved /> : <BookmarkUnsaved />}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FilterCard);
