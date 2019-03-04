import React, { Component } from 'react';

import axios from 'axios';

import ClassDetails from './ClassDetails.jsx';
import ClassSections from './ClassSections.jsx';

class ClassDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
      courseData: {},
    }
    this.details = this.details.bind(this)
    this.sections = this.sections.bind(this)
  }

  details() {
    this.setState({ tab: 0 })
  }

  sections() {
    this.setState({ tab: 1 })
  }

  componentDidMount() {
    this.updateCourse(this.props.course);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (Object.keys(this.state.courseData).length == 0) {
  //     return true;
  //   } else if (this.state.tab !== nextState.tab) {
  //     return true;
  //   }

  //   console.log(this.props);
  //   console.log(nextProps);

  //   return this.state.courseData.course.id !== nextProps.course.id;
  // }

  componentDidUpdate(prevProps, prevState) {
    if(Object.keys(prevState.courseData).length == 0) {
      this.updateCourse(this.props.course);
    }
    else if(this.props.course.id !== prevState.courseData.course.id) {
      this.updateCourse(this.props.course);
    }
  }

  updateCourse(course) {
    let courseID = course.id;
    let courseAbbreviation = course.abbreviation;
    let courseNumber = course.courseNumber;
    axios.get(`/api/catalog_json/course_box/`, {
      params: {
        course_id: courseID,
      }
    })
    .then(res => {
      console.log(res);
      this.setState({
        courseData: res.data,
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
    const { tab, courseData } = this.state;
    const info = this.props
    let { course, sections } = courseData;
    return (
      <div>
      {course &&
        <div className="card filter-description">
          <div className="filter-description-header">
            <h3>{course.abbreviation} {course.course_number}</h3>
            <p>{course.units} Units</p>
          </div>
          <p className="filter-description-title">{course.title}</p>
          <div className="filter-description-stats">
            <div className="filter-description-stats-avg">
              <p>Course Average: {course.letter_average || 'N/A'}</p>
              <a>See grade distributions</a>
            </div>
            <div className="filter-description-stats-enroll">
              <p>Enrollment: {course.enrolled} / {course.enrolled_max}</p>
              <a>See enrollment history</a>
            </div>
          </div>
          {/* <p className="filter-description-instructors">Instructor(s): {info.instructors}</p> */}
          <div className="filter-description-tabs">
            <div className="tabs">
              <ul>
                <li className={tab == 0 ? 'is-active' : ''}><a onClick={this.details}>Course Details</a></li>
                <li className={tab == 1 ? 'is-active' : ''}><a onClick={this.sections}>Sections</a></li>
              </ul>
            </div>
            {tab == 0 ? (
              <ClassDetails
                description={course.description}
                prerequisites={course.prerequisites}
              />
            ) : (
              <ClassSections
                sections={sections}
              />
            )}
          </div>
        </div>
      }
      </div>
    );
  }
}

ClassDescription.defaultProps = {
  courseAbbreviation: 'CS 61B',
  courseTitle: 'The Structure and Interpretation of Computer Programs',
  instructors: 'John Denero, Paul Hilfinger',
  percentageEnrolled: 60,
  enrolled: 90,
  capacity: 150,
  units: 4,
  averageGrade: 'B',
  details: 'yadayadayada',
  prerequisites: 'yadayadayada',
  sections: [
    {
      type: 'Lecture',
      ccn: '001',
      time: 'MWF 2pm-2:59pm',
      location: 'Wheeler 150',
      enrolled: 10,
      capacity: 20,
      waitlist: 9999,
      waitlistCapacity: 9999,
    },
    {
      type: 'Lab',
      ccn: '011',
      time: 'M 4pm-4:59pm',
      location: 'Soda 420',
      enrolled: 10,
      capacity: 20,
      waitlist: 1,
      waitlistCapacity: 2,
    }
  ],
  favorites: 78,
}

export default ClassDescription;
