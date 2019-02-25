import React, { Component } from 'react';
import axios from 'axios';
import FilterSelection from './FilterSelection.jsx';
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
    this.getLetterGradeValue = this.getLetterGradeValue.bind(this);
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

  getLetterGradeValue(letterGrade) {
    if(!letterGrade) {
      return -1;
    } else {
      let letterGradeValues = {
        'A': 6,
        'A-': 5,
        'B+': 4,
        'B': 3,
        'B-': 2,
        'C+': 1,
      }
      return letterGradeValues[letterGrade];
    }
  }

  compareGradeAverage(courseA, courseB) {
    return this.getLetterGradeValue(courseB.letter_average) - this.getLetterGradeValue(courseA.letter_average) ||
    this.compareDepartmentName(courseA, courseB);
  }

  compareDepartmentName(courseA, courseB) {
    let courseATitle = `${courseA.abbreviation} ${courseA.course_number}`;
    let courseBTitle = `${courseB.abbreviation} ${courseB.course_number}`;
    return courseATitle.localeCompare(courseBTitle)
  }

  sortByAttribute(sortAttribute) {
    switch (sortAttribute) {
      case 'grade_average':
        return this.compareGradeAverage;
      case 'department_name':
        return this.compareDepartmentName;
      case 'open_seats':
      case 'enrolled_percentage':
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
      if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
      }
      console.log(err.config);
    });
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
            courses
          )
        }
      </div>
    );
  }
}

export default FilterResults;
