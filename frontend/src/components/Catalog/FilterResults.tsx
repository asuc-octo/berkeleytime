import BTLoader from "components/Common/BTLoader";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { CourseReference } from "utils/courses/course";
import { searchCourses } from "utils/courses/search";
import { sortByAttribute, CourseSortAttribute } from "utils/courses/sorting";

import {
  CourseOverviewFragment,
  useGetCoursesForFilterQuery,
} from "../../graphql/graphql";
import FilterCard from "./FilterCard";
import {gql, useQuery} from '@apollo/client'


type FilterResultsProps = {
  activePlaylists: string[];
  selectCourse?: (course: CourseOverviewFragment) => void;
  selectedCourse: CourseReference | null;
  sortBy: CourseSortAttribute;
  query: string;
};


const GET_ALL_COURSES = gql`
  query test {
    SIS_Course {
      _id
      displayName
    }
  }
`;

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
  const { data, loading, error } = useQuery(GET_ALL_COURSES);
  // const { data, loading, error } = useGetCoursesForFilterQuery({
  //   variables: {
  //     playlists: activePlaylists.join(","),
  //   },
  //   // We will not show results unless there's at least 1 filter selected.
  //   skip: showEmptyState,
  // });

  // let sortedCourses: CourseOverviewFragment[] = [];
  if (data) {
    console.log(data);
    const courses = data!.allCourses!;

    // If we're using a "Relevance" search *and* there's a search query, we'll
    // use the search text-distance as the sorting metric.
    const hasQuery = rawQuery.trim() !== "";
    // if (hasQuery) {
    //   // TODO: consider memoizing if this is slow.
    //   sortedCourses = searchCourses(courses, rawQuery);
    // } else {
    //   sortedCourses = courses.sort(sortByAttribute(sortBy));
    // }
  }

  const courseCardProps = {
    courses: data,
    sortBy,
    selectCourse: selectCourse,
    selectedCourse,
  };

  return (
    <div className="filter-results">
      {error ? (
        <div className="filter-results-loading">
          <div>A critical error occured. </div>
        </div>
      ) : loading ? (
        <BTLoader fill showInstantly />
      ) : data.length === 0 && !showEmptyState ? (
        <div className="filter-results-loading">
          <div className="filter-results-empty">
            There are no courses matching your filters.
          </div>
        </div>
      ) : (
        <div>
        {/* <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemData={courseCardProps as any}
              itemCount={data.length}
              itemSize={110}
              itemKey={(index) => data. [index]._id}
            >
              {FilterCard}
            </FixedSizeList>
          )}
        </AutoSizer> */}
         {data.allCourses._id[0]}</div> 
        
      )}
    </div>
  );
};

export default FilterResults;
