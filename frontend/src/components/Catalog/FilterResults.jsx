import React, { Component, PureComponent } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import FilterCard from './FilterCard';
import { laymanToAbbreviation, laymanSplit } from '../../variables/Variables';

import { getFilterResults, filter, makeRequest } from '../../redux/actions';
import { connect } from "react-redux";


//todo: fix filter save
class FilterResults extends Component {
  constructor(props) {
    super(props);
    this.cache = {};
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

  filter = course => {
    let {query} = this.props;
    return FilterResults.filterCourses(course, query, this.cache);
  }

  static filterCourses(course, query, cache) {
    if(query.trim() === "") { return true }
    let pseudoQuery = query.toUpperCase();
    if (cache[query]) {
      pseudoQuery = cache[query];
    } else {
      let querySplit = query.toUpperCase().split(" ");
      let longestPrefix = "";
      for (let prefix in laymanSplit) {
        if (this.arrPrefixMatch(querySplit, laymanSplit[prefix]) && prefix.length > longestPrefix.length) {
          longestPrefix = prefix;
        }
      }
      if (longestPrefix.length > 0 && pseudoQuery.startsWith(longestPrefix)) {
        pseudoQuery = pseudoQuery.replace(longestPrefix, laymanToAbbreviation[longestPrefix]);
      }
      query = query.toLowerCase();
      pseudoQuery = pseudoQuery.toLowerCase();
      cache[query] = pseudoQuery;
    }

    return FilterResults.matches(course, query) || (query !== pseudoQuery && FilterResults.matches(course, pseudoQuery));
  }

  static arrPrefixMatch(arr, prefix) {
    if (arr.length < prefix.length) {
      return false;
    }
    for (let i = 0; i < prefix.length; i++) {
      if (arr[i] !== prefix[i]) {
        return false;
      }
    }
    return true;
  }

  static matches(course, query) {
    let courseMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    let otherNumber;
    if (course.course_number.indexOf("C") !== -1) { // if there is a c in the course number
        otherNumber = course.course_number.substring(1);
    } else { // if there is not a c in the course number
        otherNumber = "C" + course.course_number;
    }
    var courseFixedForCMatches = (`${course.abbreviation} ${otherNumber} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    return courseMatches || courseFixedForCMatches;
  }

  render() {
    const { sortBy, loading } = this.props;
    var courses;
    if(!loading) {
      courses = this.props.courses
        .sort(FilterResults.sortByAttribute(sortBy))
        .filter(this.filter);
    } else {
      courses = <div></div>
    }
    let data = {
      courses,
      sortBy,
      selectCourse: this.props.selectCourse,
      selectedCourseId: this.props.selectedCourse.id,
    }

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
