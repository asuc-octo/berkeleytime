import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { HashLoader } from 'react-spinners';

import people from '../../assets/svg/catalog/people.svg';
import chart from '../../assets/svg/catalog/chart.svg';
import book from '../../assets/svg/catalog/book.svg';
import launch from '../../assets/svg/catalog/launch.svg';

import vars from '../../variables/Variables';

import { updateCourses, getCourseData, makeRequestDescription, setRequirements, setUnits, setDepartment, setLevel, setSemester } from '../../redux/actions';
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

  goToEnrollment(courseData) {
    const { history } = this.props;
    let url = `/enrollment/0-${courseData.course.id}-fall-2019-all`;
    history.push(url);
  }

  goToGrades(courseData) {
    const { history } = this.props;
    let url = `/grades/0-${courseData.course.id}-all-all`;
    history.push(url);
  }

  pillFilter(req) {
    const { filterMap, modifyFilters, setRequirements, setUnits, setDepartment, setLevel, setSemester } = this.props;
    const { requirements, units, department, level, semester } = this.props;
    if (filterMap === null || filterMap[req] === null) {
      return;
    }
    var formattedFilter = {
      value: filterMap[req].id,
      label: req
    };
    const newFilters = list => {
      if (list == null) {
        return [formattedFilter];
      }
      let isDuplicate = list.some(item => item.value == formattedFilter.value);
      if (isDuplicate) {
        return list;
      }
      return [...list, formattedFilter];
    }
    switch (filterMap[req].type) {
      case 'requirements':
        setRequirements(newFilters(requirements));
        break;
      case 'department':
        setDepartment(formattedFilter);
        break;
      case 'units':
        setUnits(newFilters(units));
        break;
      case 'level':
        setLevel(newFilters(level));
        break;
      case 'semester':
        setSemester(newFilters(semester));
        break;
      default:
        return;
    }
    modifyFilters(new Set([formattedFilter.value]), new Set());
  }

  render() {
    const { courseData, loading } = this.props;
    const { course, sections, universal_requirements } = courseData;
    const { semester, year } = vars.currentSemester;

    const toGrades = {
      pathname: course != null ? `/grades/0-${course.id}-all-all` : `/grades`,
      state: { course: course },
    };

    const toEnrollment = {
      pathname: course != null ? `/enrollment/0-${course.id}-${semester}-${year}-all` : `/enrollment`,
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
                {applyIndicatorPercent(`${course.enrolled}/${course.enrolled_max}`, course.enrolled_percentage)} &nbsp;
                <a href={toEnrollment.pathname} target="_blank" className="statlink"><img src={launch} /></a>
              </div>
              <div className="statline">
                <img src={chart} />
                Average Grade:
                {applyIndicatorGrade(course.letter_average, course.letter_average)} &nbsp;
                <a href={toGrades.pathname} target="_blank" className="statlink"><img src={launch} /></a>
              </div>
              <div className="statline">
                <img src={book} />
                {formatUnits(course.units)}
              </div>
            </div>
            <div className="pill-container">
              {universal_requirements.map(req => <div className="pill" onClick={() => this.pillFilter(req)}>{req}</div>)}
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
    updateCourses: (data) => dispatch(updateCourses(data)),
    setRequirements: (data) => dispatch(setRequirements(data)),
    setUnits: (data) => dispatch(setUnits(data)),
    setDepartment: (data) => dispatch(setDepartment(data)),
    setLevel: (data) => dispatch(setLevel(data)),
    setSemester: (data) => dispatch(setSemester(data))
  }
}

const mapStateToProps = state => {
  const { loading, courseData, filterMap } = state.classDescription;
  const { requirements, units, department, level, semester } = state.filter;
  return {
    loading,
    courseData,
    filterMap,
    requirements, units, department, level, semester
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ClassDescription));
