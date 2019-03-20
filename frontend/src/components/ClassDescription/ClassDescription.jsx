import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import axios from 'axios';

import ClassDetails from './ClassDetails.jsx';
import ClassSections from './ClassSections.jsx';

// import grade_icon from '../../assets/img/images/catalog/grade.svg';
// import enrollment_icon from '../../assets/img/images/catalog/enrollment.svg';

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
    let { course, sections } = courseData;

    console.log(courseData);

    let gradeTo = {
      pathname: '/grades',
      courseID: 111,
    };

    let enrollmentTo = {
      pathname: '/enrollment',
      courseID: 112,
    }
    return (
      <div>
      {course &&
        <div className="card filter-description">
          <div className="filter-description-header">
            <h3>{course.abbreviation} {course.course_number}</h3>
            <p>{`${course.units} Unit${course.units !== '1.0' ? 's' : ''}`.replace(/.0/g, "").replace(/-/g, " - ")}</p>
          </div>
          <p className="filter-description-title">{course.title}</p>
          <div className="filter-description-stats">
            <FontAwesome className={`filter-description-stats-icon`} name={'bar-chart'}/>
            <div className="filter-description-stats-avg">
              <p>Course Average: {course.letter_average || 'N/A'}
                &nbsp;(<Link to={gradeTo}>See grade distributions</Link>)
              </p>

            </div>
            <FontAwesome className={`filter-description-stats-icon`} name={'user-o'}/>
            <div className="filter-description-stats-enroll">
              <p>Enrollment: {course.enrolled}/{course.enrolled_max}
                &nbsp;(<Link to={enrollmentTo}>See enrollment history</Link>)
              </p>
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

export default ClassDescription;
