import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import { BarLoader } from 'react-spinners';

import axios from 'axios';

import ClassDetails from './ClassDetails.jsx';
import ClassSections from './ClassSections.jsx';

// import grade_icon from '../../assets/img/images/catalog/grade.svg';
// import enrollment_icon from '../../assets/img/images/catalog/enrollment.svg';

class ClassDescription extends Component {
  constructor(props) {
    super(props);
    let { tab } = props;
    this.state = {
      tab: tab,
      courseData: {},
      loading: true,
    }
    this.details = this.details.bind(this)
    this.sections = this.sections.bind(this)
  }

  details() {
    let course = this.state.courseData.course;
    this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/`);
    this.setState({ tab: 0 })
  }

  sections() {
    let course = this.state.courseData.course;
    this.props.history.replace(`/catalog/${course.abbreviation}/${course.course_number}/sections/`);
    this.setState({ tab: 1 })
  }

  componentDidMount() {
    this.updateCourse(this.props.course);
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.loading) {
      return
    }

    if(Object.keys(prevState.courseData).length == 0) {
      this.updateCourse(this.props.course);
    }
    else if(this.props.course.id !== this.state.courseData.course.id) {
      this.updateCourse(this.props.course);
    }
  }

  updateCourse(course) {
    let courseID = course.id;
    this.setState({loading: true});

    axios.get(`/api/catalog/catalog_json/course_box/`, {
      params: {
        course_id: courseID,
      }
    })
    .then(res => {
      // console.log(res);
      this.setState({
        courseData: res.data,
        loading: false,
      })
    })
    .catch((err) => {
      console.log(err)
    });
  }

  render() {
    const { tab, courseData } = this.state;
    let { course, sections, requirements } = courseData;

    let gradeTo = {
      pathname: '/grades',
      state: {course: course},
    };

    let enrollmentTo = {
      pathname: '/enrollment',
      state: {course: course},
    }
    return (
      <div className="filter-description-container">
      {this.state.loading ? (
        <div className="filter-description-loading">
            <BarLoader
            sizeUnit={"px"}
            size={150}
            color={'#123abc'}
            loading={true}
          />
       </div>
      ) : (
        Object.entries(course).length !== 0 &&
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
                  requirements={requirements}
                />
              ) : (
                <ClassSections
                  sections={sections}
                />
              )}
            </div>
          </div>
      )
      }
      </div>
    );
  }
}

export default withRouter(ClassDescription);
