import React, { Component } from 'react';
import axios from 'axios';
import FilterSelection from './FilterSelection.jsx';
import { BarLoader } from 'react-spinners';

class FilterResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courses: [],
      loading: true,
    }
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

  updateCourses(filters) {
    this.setState({
      loading: true,
    });

    axios.get('http://localhost:8000/catalog/filter', {
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
      courses = this.state.courses.map(course => (
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
        <h4>Showing results for:</h4>
        {this.state.loading ? (
            <BarLoader
              sizeUnit={"px"}
              size={150}
              color={'#123abc'}
              loading={this.state.loading}
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
