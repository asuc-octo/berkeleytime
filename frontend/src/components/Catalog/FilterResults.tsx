import React from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import FilterCard from './FilterCard';

import {
  CourseOverviewFragment,
  useGetCoursesForFilterQuery,
} from '../../graphql/graphql';
import { searchCourses } from 'utils/courses/search';
import { sortByAttribute, CourseSortAttribute } from 'utils/courses/sorting';
import BTLoader from 'components/Common/BTLoader';
import { CourseReference } from 'utils/courses/course';

type FilterResultsProps = {
  activePlaylists: string[];
  selectCourse?: (course: CourseOverviewFragment) => void;
  selectedCourse: CourseReference | null;
  sortBy: CourseSortAttribute;
  query: string;
};

/**
 * Component for course list
 */
const FilterResults = ({
  activePlaylists,
  selectCourse,
  selectedCourse,
  sortBy,
  query: rawQuery,
}: FilterResultsProps) => {
  const showEmptyState = activePlaylists.length === 0;
  const { data, loading, error } = useGetCoursesForFilterQuery({
    variables: {
      playlists: activePlaylists.join(','),
    },
    // We will not show results unless there's at least 1 filter selected.
    skip: showEmptyState,
  });

  let sortedCourses: CourseOverviewFragment[] = [];
  if (data) {
    const courses = data!.allCourses!.edges.map((edge) => edge!.node!);

    // If we're using a "Relevance" search *and* there's a search query, we'll
    // use the search text-distance as the sorting metric.
    const hasQuery = rawQuery.trim() !== '';
    if (hasQuery) {
      // TODO: consider memoizing if this is slow.
      sortedCourses = searchCourses(courses, rawQuery);
    } else {
      sortedCourses = courses.sort(sortByAttribute(sortBy));
    }
  }

  const courseCardProps = {
    courses: sortedCourses,
    sortBy,
    selectCourse: selectCourse,
    selectedCourse,
  };

  return (
    <div className="filter-results">
      {error ? (
        <div className="filter-results-loading">
          <div>A critical error occured.</div>
        </div>
      ) : loading ? (
        <BTLoader />
      ) : sortedCourses.length === 0 && !showEmptyState ? (
        <div className="filter-results-loading">
          <div className="filter-results-empty">
            There are no courses matching your filters.
          </div>
        </div>
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemData={courseCardProps}
              itemCount={sortedCourses.length}
              itemSize={110}
              itemKey={(index) => sortedCourses[index].id}
            >
              {FilterCard}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </div>
  );
};

export default FilterResults;
