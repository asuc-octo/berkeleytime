import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { HashLoader } from 'react-spinners';

import axios from 'axios';

import ClassDetails from './ClassDetails';
import ClassSections from './ClassSections';

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

class ClassDescription extends Component {
  static formatEnrollmentPercentage(percentage) {
    return `${Math.floor(percentage * 100, 100)}% enrolled`;
  }

  static colorEnrollment(percentage) {
    const pct = Math.floor(percentage * 100, 100);
    if (pct < 33) {
      return 'enrollment-first-third';
    } else if (pct < 67) {
      return 'enrollment-second-third';
    } else {
      return 'enrollment-last-third';
    }
  }

  static formatDate(date) {
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  constructor(props) {
    super(props);

    this.state = {
      courseData: {},
      loading: true,
    };
  }

  details = () => {
    this.props.selectCourse(this.props.course, 0);
  }

  sections = () => {
    this.props.selectCourse(this.props.course, 1);
  }

  componentDidMount() {
    this.updateCourseData();
  }

  /**
   * Updates course data if course changes
   */
  componentDidUpdate(prevProps) {
    if (isEmpty(prevProps.course)) {
      if (!isEmpty(this.props.course)) {
        this.updateCourseData();
      }
    } else if (!isEmpty(this.props.course) && prevProps.course.id !== this.props.course.id) {
      this.updateCourseData();
    } else if (isEmpty(this.props.course)) {
      this.updateCourseData();
    }
  }

  updateCourseData() {
    const { course } = this.props;

    if (isEmpty(course)) {
      this.setState({
        courseData: {},
        loading: false,
      });
      return;
    }

    this.setState({ loading: true }, () => {
      axios.get(`http://localhost:8080/api/catalog_json/course_box/`, {
        params: {
          course_id: course.id,
        }
      }).then(res => {
        console.log(res);
        this.setState({
          courseData: res.data,
          loading: false,
        });
      }).catch((err) => {
        console.log(err)
      });
    });
  }

  render() {
    const { courseData } = this.state;
    const { course, sections, requirements } = courseData;

    const toGrades = {
      pathname: '/grades',
      state: { course: course },
    };

    const toEnrollment = {
      pathname: '/enrollment',
      state: { course: course },
    }

    if (this.state.loading) {
      return (
        <div className="catalog-description-container">
          <div className="loading">
            <HashLoader color="#579EFF" size="50" sizeUnit="px" />
          </div>
        </div>
      );
    } else if (isEmpty(courseData)) {
      return null;
    } else {
      return (
        <div className="catalog-description-container">
          <div className="catalog-description">
            <h3>{course.abbreviation} {course.course_number}</h3>
            <h6>{course.title}</h6>
            <div className="stats">
              <p className={ClassDescription.colorEnrollment(course.enrolled_percentage)}>
                {ClassDescription.formatEnrollmentPercentage(course.enrolled_percentage)}
              </p>
              &nbsp;<p>•</p>&nbsp;
              <p>{course.waitlisted} waitlisted</p>
            </div>
            <p className="description">
              {course.description}
            </p>
            <h5>Class Times</h5>
            <div>
            <Table className="table">
              <thead>
                <tr>
                  <th style={{width: '75px'}}><abbr title="Lecture/Discussion/Lab">Type</abbr></th>
                  <th style={{width: '50px'}}><abbr title="Course Capture Number">CCN</abbr></th>
                  <th style={{width: '100px'}}>Instructor</th>
                  <th style={{width: '85px'}}>Time</th>
                  <th style={{width: '85px'}}>Location </th>
                  <th style={{width: '75px'}}>Enrolled </th>
                  <th style={{width: '75px'}}>Waitlist </th>
                </tr>
              </thead>
              <tbody>
                {sections.map(section => {
                  let startDate = new Date(section.start_time + "Z");
                  let endDate = new Date(section.end_time + "Z");
                  return (
                    <tr>
                      <td>{section.kind}</td>
                      <td>{section.ccn}</td>
                      <td>{section.instructor}</td>
                      {!isNaN(startDate) && !isNaN(endDate) ? (
                      <td>{section.word_days} {ClassDescription.formatDate(startDate)} - {ClassDescription.formatDate(endDate)}</td>
                      ) : (
                        <td></td>
                      )}
                      <td>{section.location_name}</td>
                      <td>{section.enrolled}/{section.enrolled_max}</td>
                      <td>{section.waitlisted}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            </div>
          </div>
        </div>
      );
    }
    /*return (
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
    );*/
  }
}

export default withRouter(ClassDescription);
