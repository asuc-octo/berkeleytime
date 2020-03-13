import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { HashLoader } from 'react-spinners';

import people from '../../assets/svg/catalog/people.svg';
import chart from '../../assets/svg/catalog/chart.svg';
import book from '../../assets/svg/catalog/book.svg';

import { updateCourses, getCourseData, makeRequestDescription } from '../../redux/actions';
import { connect } from "react-redux";

import {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits
} from '../../utils/utils';

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
    const { course, getCourseData, makeRequestDescription, updateCourses } = this.props;
    if (isEmpty(course)) {
      updateCourses({});
      return;
    }

    makeRequestDescription();
    getCourseData(course.id);
  }

  render() {
    const { courseData, loading } = this.props;
    const { course, sections, requirements } = courseData;


    const toGrades = {
      pathname: '/grades',
      state: { course: course },
    };

    const toEnrollment = {
      pathname: '/enrollment',
      state: { course: course },
    }

    if (loading) {
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
              <div className="statline">
                <img src={people} />
                Enrolled:
                {applyIndicatorPercent(`${course.enrolled}/${course.enrolled_max}`, course.enrolled_percentage)}
              </div>
              <div className="statline">
                <img src={chart} />
                Average Grade:
                {applyIndicatorGrade(course.letter_average, course.letter_average)}
              </div>
              <div className="statline">
                <img src={book} />
                {formatUnits(course.units)}
              </div>
            </div>
            <p className="description">
              {course.description}
            </p>
            <h5>Class Times</h5>
            <div className="table-container">
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
  }
}


const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    getCourseData: (id) => dispatch(getCourseData(id)),
    makeRequestDescription: () => dispatch(makeRequestDescription()),
    updateCourses: (data) => dispatch(updateCourses(data))
  }
}

const mapStateToProps = state => {
  const { loading, courseData } = state.classDescription;
  return {
    loading,
    courseData
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ClassDescription));

/*

            <div className="stats">
              <p className={ClassDescription.colorEnrollment(course.enrolled_percentage)}>
                {ClassDescription.formatEnrollmentPercentage(course.enrolled_percentage)}
              </p>
              &nbsp;<p>•</p>&nbsp;
              <p>{course.waitlisted} waitlisted</p>
            </div>
*/