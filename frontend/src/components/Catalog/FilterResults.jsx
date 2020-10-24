import React, { Component, PureComponent } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import FilterCard from './FilterCard';
import { laymanToAbbreviation } from '../../variables/Variables';

import { getFilterResults, filter, makeRequest } from '../../redux/actions';
import { connect } from "react-redux";
import { search } from 'utils/search';

/**
 * Component for course list
 */
class FilterResults extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.updateCourses();
  }

  componentDidUpdate(prevProps) {
    let prevFilters = Array.from(prevProps.activePlaylists).join(',');
    let nextFilters = Array.from(this.props.activePlaylists).join(',');

    if(prevFilters !== nextFilters) {
      this.updateCourses();
    }
  }

  updateCourses() {
    const { getFilterResults, makeRequest, filter } = this.props;
    if (this.props.activePlaylists.size === 0) {
      filter([]);
      return;
    }

    let filters = Array.from(this.props.activePlaylists).join(',');
    makeRequest();
    getFilterResults(filters);
  }

  /**
   * Comparator for department name
   */
  static compareDepartmentName(courseA, courseB) {
    let courseATitle = `${courseA.abbreviation} ${courseA.course_number}`;
    let courseBTitle = `${courseB.abbreviation} ${courseB.course_number}`;
    return courseATitle.localeCompare(courseBTitle);
  }

  /**
   * Compares courses by relevance. "Relevance" is only a term relevant to
   * searching so this defaults to "average grade" when not being
   * search-filtered.
   */
  static compareRelevance(courseA, courseB) {
    return FilterResults.compareAverageGrade(courseA, courseB);
  }

  /**
   * Comparator for average gpa, break ties by department name
   */
  static compareAverageGrade = (courseA, courseB) => {
    return courseB.grade_average - courseA.grade_average
      || FilterResults.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for open seats, break ties by department name
   */
  static compareOpenSeats(courseA, courseB) {
    return courseB.open_seats - courseA.open_seats
      || FilterResults.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for enrolled percentage, break ties by department name
   * If percentage is -1, it is put at the end (greater than all other percents)
   */
  static compareEnrollmentPercentage(courseA, courseB) {
    if (courseA.enrolled_percentage !== -1 && courseB.enrolled_percentage !== -1) {
      return courseA.enrolled_percentage - courseB.enrolled_percentage
        || FilterResults.compareDepartmentName(courseA, courseB);
    } else if (courseA.enrolled_percentage === -1 && courseB.enrolled_percentage === -1) {
      return FilterResults.compareDepartmentName(courseA, courseB);
    } else {
      return courseB.enrolled_percentage - courseA.enrolled_percentage;
    }
  }

  /**
   * Returns comparator based on the sort
   */
  static sortByAttribute(sortAttribute) {
    switch (sortAttribute) {
      case 'relevance':
        return FilterResults.compareRelevance;
      case 'average_grade':
        return FilterResults.compareAverageGrade;
      case 'department_name':
        return FilterResults.compareDepartmentName;
      case 'open_seats':
        return FilterResults.compareOpenSeats;
      case 'enrolled_percentage':
        return FilterResults.compareEnrollmentPercentage;
    }
  }

  /**
   * Takes the search query and returns a list of matching items sorted by
   * text-distance.
   */
  calculateQueryResults() {
    let { courses, query } = this.props;
    const MAX_DISTANCE = 0;
    const results = courses
      .map(
        (course) =>
          [
            course,
            search(query, FilterResults.searchKeyForCourse(course), MAX_DISTANCE)
          ])
      .filter(
        ([course, distance]) => distance >= 0)
      .sort((a, b) => a[1] - b[1])
      .map(([course]) => course);
    return results;
  }

  /**
   * Determines if a search query has been entered.
   */
  hasSearchQuery() {
    return this.props.query.trim() !== "";
  }

  /**
   * Generates a 'search string' for a course.
   */
  static searchKeyForCourse(course) {
    const searchComponents = [
      course.abbreviation,
      course.course_number,
      // course.title,
      // course.department
    ];

    // Have a version of course number with 'C' and without 'C'
    if (course.course_number.indexOf("C") !== -1) {
      searchComponents.push(course.course_number.substring(1));
    } else { // if there is not a c in the course number
      searchComponents.push("C" + course.course_number);
    }

    return searchComponents.join(" ").toLowerCase();

    // Apply the 'layman' abbrs (compsci => cs) to allow for abbrs to get higher
    // search ranking.
    for (const [shortAbbr, longAbbr] of laymanToAbbreviation) {
      course.abbreviation
    }
  }

  render() {
    const {
      courses: unfilteredCourses,
      query,
      sortBy,
      loading
    } = this.props;

    let courses = unfilteredCourses;
    if (!loading) {
      // If we're using a "Relevance" search *and* there's a search query, we'll
      // use the search text-distance as the sorting metric.
      if (this.hasSearchQuery()) {
        courses = this.calculateQueryResults();
      }

      if (sortBy !== 'relevance') {
        courses = courses
          .sort(FilterResults.sortByAttribute(sortBy));
      }

    } else {
      courses = <div></div>
    }

    let data = {
      courses,
      sortBy,
      selectCourse: this.props.selectCourse,
      selectedCourseId: this.props.selectedCourse.id,
    };

    return (
      <div className="filter-results">
        {
          loading
            ? (
              <div className="filter-results-loading">
                <BeatLoader color="#579EFF" size="15" sizeUnit="px" />
              </div>
            )
            : (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemData={data}
                    itemCount={data.courses.length}
                    itemSize={110}
                    itemKey={(index, data) => data.courses[index].id}
                  >
                    {FilterCard}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )
        }
      </div>
    );
  }
}


const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    getFilterResults: (filter) => dispatch(getFilterResults(filter)),
    makeRequest: () => dispatch(makeRequest()),
    filter: (data) => dispatch(filter(data))
  }
}

const mapStateToProps = state => {
  const { loading, courses } = state.filter;
  return {
    loading,
    courses,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterResults);
