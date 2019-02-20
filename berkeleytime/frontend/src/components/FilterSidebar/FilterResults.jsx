import React, { Component } from 'react';
import axios from 'axios';
import FilterSelection from './FilterSelection.jsx';

class FilterResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      courses: [],
    }
  }

  componentDidMount() {
    const { activeFilters } = this.props;
    console.log(activeFilters);
    axios.get('http://localhost:8000/catalog/filter', {
      params: {
        filters: Array.from(activeFilters).join(','),
      },
    })
    .then(res => {
      console.log(res);
      this.setState({
        courses: res.data,
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
    return (
      <div className="filter-results">
        <h4>Showing results for:</h4>
        {this.state.courses.map(course => (
          <FilterSelection
            id={course.id}
            courseAbbreviation={`${course.abbreviation} ${course.course_number}`}
            courseTitle={course.title}
            percentageEnrolled={course.enrolled_percentage}
            waitlisted={course.waitlisted}
            averageGrade={course.letter_average}
          />
        ))}
      </div>
    );
  }
}

FilterResults.defaultProps = {
  classesChosen: [
    {
      courseAbbreviation: 'CS 61B',
      courseTitle: 'The Structure and Interpretation of Computer Programs',
      percentageEnrolled: 97,
      waitlisted: 120,
      units: 4,
      averageGrade: 'B',
    },
    {
      courseAbbreviation: 'Math 1A',
      courseTitle: 'Single Variable Calculus',
      percentageEnrolled: 82,
      waitlisted: 27,
      units: 4,
      averageGrade: 'B-',
    },
    {
      courseAbbreviation: 'English 43B',
      courseTitle: 'Introduction to the Art of Verse',
      percentageEnrolled: 63,
      waitlisted: 3,
      units: 3,
      averageGrade: 'A-',
    },
    {
      courseAbbreviation: 'Art 18',
      courseTitle: 'The Language of Painting',
      percentageEnrolled: 66,
      waitlisted: 0,
      units: 2,
      averageGrade: 'C',
    },

  ],
};

export default FilterResults;
