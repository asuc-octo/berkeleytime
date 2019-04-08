import React, { Component, PureComponent } from 'react';
import axios from 'axios';
import FilterSelection from './FilterSelection.jsx';
import { FixedSizeList } from 'react-window';
import { BarLoader } from 'react-spinners';

import { laymanToAbbreviation } from '../../variables/Variables';


class FilterResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courses: [],
      loading: true,
    }

    this.compareGradeAverage = this.compareGradeAverage.bind(this);
    this.compareDepartmentName = this.compareDepartmentName.bind(this);
    this.compareOpenSeats = this.compareOpenSeats.bind(this);
    this.compareEnrollmentPercentage = this.compareEnrollmentPercentage.bind(this);
    this.courseMatches = this.courseMatches.bind(this);
    this.filterCourses = this.filterCourses.bind(this);
  }

  componentDidMount() {
    let filters = Array.from(this.props.activeFilters).join(',');
    this.updateCourses(filters);
  }

  componentDidUpdate(prevProps) {
    let prevFilters = Array.from(prevProps.activeFilters).join(',');
    let nextFilters = Array.from(this.props.activeFilters).join(',');

    if(prevFilters !== nextFilters) {
      this.updateCourses(nextFilters);
    }
  }

  /**
   * Comparator for average gpa, break ties by department name
   */
  compareGradeAverage(courseA, courseB) {
    return courseB.grade_average - courseA.grade_average
      || this.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for department name
   */
  compareDepartmentName(courseA, courseB) {
    let courseATitle = `${courseA.abbreviation} ${courseA.course_number}`;
    let courseBTitle = `${courseB.abbreviation} ${courseB.course_number}`;
    return courseATitle.localeCompare(courseBTitle)
  }

  /**
   * Comparator for open seats, break ties by department name
   */
  compareOpenSeats(courseA, courseB) {
    return courseB.open_seats - courseA.open_seats
      || this.compareDepartmentName(courseA, courseB);
  }

  /**
   * Comparator for enrolled percentage, break ties by department name
   * If percentage is -1, it is put at the end (greater than all other percents)
   */
  compareEnrollmentPercentage(courseA, courseB) {
    if (courseA.enrolled_percentage != -1 && courseB.enrolled_percentage != -1) {
      return courseA.enrolled_percentage - courseB.enrolled_percentage
        || this.compareDepartmentName(courseA, courseB);
    } else if (courseA.enrolled_percentage == -1 && courseB.enrolled_percentage == -1) {
      return this.compareDepartmentName(courseA, courseB);
    } else {
      return courseB.enrolled_percentage - courseA.enrolled_percentage;
    }
  }

  /**
   * Returns comparator based on the sort
   */
  sortByAttribute(sortAttribute) {
    switch (sortAttribute) {
      case 'grade_average':
        return this.compareGradeAverage;
      case 'department_name':
        return this.compareDepartmentName;
      case 'open_seats':
        return this.compareOpenSeats;
      case 'enrolled_percentage':
        return this.compareEnrollmentPercentage;
    }
  }

  courseMatches(course, query) {
    let courseMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    let otherNumber;
    if (course.course_number.indexOf("C") !== -1) { // if there is a c in the course number
        otherNumber = course.course_number.substring(1);
    } else { // if there is not a c in the course number
        otherNumber = "C" + course.course_number;
    }
    var courseFixedForCMatches = (`${course.abbreviation} ${course.course_number} ${course.title} ${course.department}`).toLowerCase().indexOf(query) !== -1;
    return courseMatches || courseFixedForCMatches;
  }

  filterCourses(course) {
    let { query } = this.props;
    let courseTitle = `${course.abbreviation} ${course.course_number}`
    if(query.trim() === "") { return true }
    let querySplit = query.toUpperCase().split(" ");
    if(querySplit[0] in laymanToAbbreviation) {
      querySplit[0] = laymanToAbbreviation[querySplit[0]];
    }
    query = query.toLowerCase();
    var pseudoQuery = querySplit.join(" ").toLowerCase();
    var useOriginalQuery = (querySplit.length === 1 && query !== pseudoQuery);
    return (useOriginalQuery && this.courseMatches(course, query)) || this.courseMatches(course, pseudoQuery);
  }

  updateCourses(filters) {
    this.setState({
      loading: true,
    });

    console.log("filters:");
    console.log(filters);

    axios.get('/api/catalog/filter/', {
      params: {
        filters: filters,
      },
    })
    .then(res => {
      console.log(res);
      this.setState({
        courses: res.data,
        loading: false
      })
    })
    .catch((err) => {
      console.log(err);
    });
  }

  onItemsRendered({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex
  }) {
    console.log(visibleStopIndex);
  }

  onScroll({
    scrollDirection,
    scrollOffset,
    scrollUpdateWasRequested
  }) {
    // scrollDirection is either "forward" or "backward".

    // scrollOffset is a number.

    // scrollUpdateWasRequested is a boolean.
    // This value is true if the scroll was caused by scrollTo() or scrollToItem(),
    // And false if it was the result of a user interaction in the browser.
    console.log(scrollOffset);
  }

  render() {
    let courses;
    if(!this.state.loading) {
      courses = this.state.courses
      .sort(this.sortByAttribute(this.props.sortBy))
      .filter(this.filterCourses)
      .map(course => (
        <FilterSelection
          id={course.id}
          courseAbbreviation={course.abbreviation}
          courseNumber={course.course_number}
          courseTitle={course.title}
          percentageEnrolled={course.enrolled_percentage}
          waitlisted={course.waitlisted}
          averageGrade={course.letter_average}
          units={course.units}
          openSeats={course.open_seats}
          sortBy={this.props.sortBy}
          onClick={this.props.selectCourse}
        />
      ));
    } else {
      courses = <div></div>
    }

    return (
      <div className="filter-results">
        {this.state.loading ? (
            <BarLoader
              sizeUnit={"px"}
              size={150}
              color={'#123abc'}
              loading={true}
            />
          ) : (
            <FixedSizeList
              className="filter-list"
              itemData={courses}
              height={1000}
              itemCount={courses.length}
              itemSize={150}
              width={"100%"}
              onItemsRendered={this.onItemsRendered}
              onScroll={this.onScroll}>
              {ItemRenderer}
            </FixedSizeList>
          )
        }
      </div>
    );
  }
}

class ItemRenderer extends PureComponent {
  render() {
    const { index, data, style } = this.props;
    return (
      <div style={style}>
        {data[index]}
      </div>
    );
  }
}

export default FilterResults;
