import React, { Component } from "react";
import Radium from "radium";
import { withRouter, Link } from "react-router-dom";
import { Table } from "react-bootstrap";
import { BeatLoader } from "react-spinners";

import people from "../../assets/svg/catalog/people.svg";
import chart from "../../assets/svg/catalog/chart.svg";
import book from "../../assets/svg/catalog/book.svg";
import launch from "../../assets/svg/catalog/launch.svg";

import denero from "../../assets/img/eggs/denero.png";
import hug from "../../assets/img/eggs/hug.png";
import hilf from "../../assets/img/eggs/hilf.png";
import sahai from "../../assets/img/eggs/sahai.png";
import scott from "../../assets/img/eggs/scott.png";
import kubi from "../../assets/img/eggs/kubi.png";
import garcia from "../../assets/img/eggs/garcia.png";

import {
  updateCourses,
  getCourseData,
  makeRequestDescription,
  setRequirements,
  setUnits,
  setDepartment,
  setLevel,
  setSemester,
} from "../../redux/actions";
import { connect } from "react-redux";

import {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
} from "../../utils/utils";

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

const easterEggImages = {
  "DENERO J": denero,
  "HUG J": hug,
  "SAHAI A": sahai,
  "HILFINGER P": hilf,
  "SHENKER S": scott,
  "KUBIATOWICZ J": kubi,
  "GARCIA D": garcia,
};

class ClassDescription extends Component {
  static formatEnrollmentPercentage(percentage) {
    return `${Math.floor(percentage * 100, 100)}% enrolled`;
  }

  static colorEnrollment(percentage) {
    const pct = Math.floor(percentage * 100, 100);
    if (pct < 33) {
      return "enrollment-first-third";
    } else if (pct < 67) {
      return "enrollment-second-third";
    } else {
      return "enrollment-last-third";
    }
  }

  static formatDate(date) {
    var hours = date.getUTCHours();
    var minutes = date.getUTCMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  constructor(props) {
    super(props);

    this.state = {
      readMore: false,
    };
  }

  details = () => {
    this.props.selectCourse(this.props.course, 0);
  };

  sections = () => {
    this.props.selectCourse(this.props.course, 1);
  };

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
    } else if (
      !isEmpty(this.props.course) &&
      prevProps.course.id !== this.props.course.id
    ) {
      this.updateCourseData();
    } else if (isEmpty(this.props.course)) {
      this.updateCourseData();
    }
  }

  updateCourseData() {
    const {
      course,
      getCourseData,
      makeRequestDescription,
      updateCourses,
    } = this.props;
    this.setReadMore(false);
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
    const {
      filterMap,
      modifyFilters,
      setRequirements,
      setUnits,
      setDepartment,
      setLevel,
      setSemester,
    } = this.props;
    const { requirements, units, department, level, semester } = this.props;
    if (filterMap === null || filterMap[req] === null) {
      return;
    }
    var formattedFilter = {
      value: filterMap[req].id,
      label: req,
    };
    const newFilters = (list) => {
      if (list === null) {
        return [formattedFilter];
      }
      let isDuplicate = list.some(
        (item) => item.value === formattedFilter.value
      );
      if (isDuplicate) {
        return list;
      }
      return [...list, formattedFilter];
    };
    switch (filterMap[req].type) {
      case "requirements":
        setRequirements(newFilters(requirements));
        break;
      case "department":
        setDepartment(formattedFilter);
        break;
      case "units":
        setUnits(newFilters(units));
        break;
      case "level":
        setLevel(newFilters(level));
        break;
      case "semester":
        setSemester(newFilters(semester));
        break;
      default:
        return;
    }
    modifyFilters(new Set([formattedFilter.value]), new Set());
  }

  setReadMore(state) {
    this.setState({
      readMore: state,
    });
  }

  findInstructor(instr) {
    if (instr === null) return;
    for (let egg in easterEggImages) {
      if (instr.indexOf(egg) !== -1) {
        return {
          ":hover": {
            cursor: `url(${easterEggImages[egg]}), auto`,
          },
        };
      }
    }
    return {};
  }

  render() {
    const { courseData, loading } = this.props;
    const { course, sections, requirements } = courseData;

    if (isEmpty(courseData)) {
      return null;
    }

    var pills = [];
    if (requirements !== null) {
      let allSemesters = requirements.filter(
        (item) => item.includes("Spring") || item.includes("Fall")
      );
      var semesterUrl =
        allSemesters.length > 0
          ? allSemesters[0].toLowerCase().split(" ").join("-")
          : null;
      let latestSemesters = allSemesters.slice(0, 4);

      let units = requirements.filter((item) => item.includes("Unit"));
      var otherFilters = requirements.filter(
        (item) =>
          !item.includes("Spring") &&
          !item.includes("Fall") &&
          !item.includes("Unit")
      );

      pills = otherFilters.concat(units).concat(latestSemesters);
    }

    const toGrades = {
      pathname: course !== null ? `/grades/0-${course.id}-all-all` : `/grades`,
      state: { course: course },
    };

    const toEnrollment = {
      pathname:
        course !== null && semesterUrl !== null
          ? `/enrollment/0-${course.id}-${semesterUrl}-all`
          : `/enrollment`,
      state: { course: course },
    };

    if (loading) {
      return (
        <div className="catalog-description-container">
          <div className="loading">
            <BeatLoader color="#579EFF" size="15" sizeUnit="px" />
          </div>
        </div>
      );
    } else {
      const charsPerRow = 80;
      const moreOffset = 15;
      var description = course.description;
      var prereqs = "";
      var moreDesc;
      var morePrereq;
      if (this.state.readMore) {
        // expand
        if (course.prerequisites) {
          prereqs = course.prerequisites;
          morePrereq = false;
        } else {
          moreDesc = false;
        }
      } else {
        // collapse
        let descRows = Math.round(course.description.length / charsPerRow);
        if (descRows > 3 || (descRows == 3 && course.prerequisites)) {
          description =
            description.slice(0, 3 * charsPerRow - moreOffset) + "...";
          moreDesc = true;
        }
        if (descRows < 3 && course.prerequisites) {
          prereqs = course.prerequisites;
          if (descRows >= 1 && prereqs.length > charsPerRow) {
            prereqs = prereqs.slice(0, charsPerRow - moreOffset) + "...";
            morePrereq = true;
          } else if (descRows == 0 && prereqs.length > 2 * charsPerRow) {
            prereqs = prereqs.slice(0, 2 * charsPerRow - moreOffset) + "...";
            morePrereq = true;
          }
        }
      }

      return (
        <div className="catalog-description-container">
          <div className="catalog-description">
            <h3>
              {course.abbreviation} {course.course_number}
            </h3>
            <h6>{course.title}</h6>
            <div className="stats">
              <div className="statline">
                <img src={people} />
                Enrolled: &nbsp;
                {course.enrolled !== -1 ? (
                  <div className="statline-div">
                    {applyIndicatorPercent(
                      `0/${course.enrolled_max}`,
                      course.enrolled_percentage
                    )}
                    &nbsp;
                    <a
                      href={toEnrollment.pathname}
                      target="_blank"
                      className="statlink"
                    >
                      <img src={launch} />
                    </a>
                  </div>
                ) : (
                  " N/A "
                )}
              </div>
              <div className="statline">
                <img src={chart} />
                Average Grade: &nbsp;
                {course.grade_average !== -1 ? (
                  <div className="statline-div">
                    {applyIndicatorGrade(
                      course.letter_average,
                      course.letter_average
                    )}{" "}
                    &nbsp;
                    <a
                      href={toGrades.pathname}
                      target="_blank"
                      className="statlink"
                    >
                      <img src={launch} />
                    </a>
                  </div>
                ) : (
                  " N/A "
                )}
              </div>
              <div className="statline">
                <img src={book} />
                {formatUnits(course.units)}
              </div>
            </div>
            <section className="pill-container">
              {pills.map((req) => (
                <div
                  className="pill"
                  key={req}
                  onClick={() => this.pillFilter(req)}
                >
                  {req}
                </div>
              ))}
            </section>
            {description.length > 0 ? (
              <p className="description">
                {description}
                {moreDesc != null ? (
                  <span onClick={() => this.setReadMore(moreDesc)}>
                    {" "}
                    {moreDesc ? " See more" : " See less"}
                  </span>
                ) : (
                  ""
                )}
              </p>
            ) : (
              ""
            )}
            {prereqs.length > 0 ? (
              <div className="prereqs">
                <h6>Prerequisites</h6>
                <p>
                  {prereqs}
                  {morePrereq != null ? (
                    <span onClick={() => this.setReadMore(morePrereq)}>
                      {" "}
                      {morePrereq ? " See more" : " See less"}
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            ) : (
              ""
            )}
            <h5>Class Times</h5>
            <div className="table-container">
              <Table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "75px" }}>Type</th>
                    <th style={{ width: "50px" }}>CCN</th>
                    <th style={{ width: "100px" }}>Instructor</th>
                    <th style={{ width: "85px" }}>Time</th>
                    <th style={{ width: "85px" }}>Location</th>
                    <th style={{ width: "75px" }}>Enrolled</th>
                    <th style={{ width: "75px" }}>Waitlist</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => {
                    let startDate = new Date(section.start_time + "Z");
                    let endDate = new Date(section.end_time + "Z");
                    return (
                      <tr
                        key={section.ccn}
                        style={this.findInstructor(section.instructor)}
                      >
                        <td>{section.kind}</td>
                        <td>{section.ccn}</td>
                        <td>{section.instructor}</td>
                        {!isNaN(startDate) && !isNaN(endDate) ? (
                          <td>
                            {section.word_days}{" "}
                            {ClassDescription.formatDate(startDate)} -{" "}
                            {ClassDescription.formatDate(endDate)}
                          </td>
                        ) : (
                          <td></td>
                        )}
                        <td>{section.location_name}</td>
                        <td>
                          {section.enrolled}/{section.enrolled_max}
                        </td>
                        <td>{section.waitlisted}</td>
                      </tr>
                    );
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

// ClassDescription = Radium(ClassDescription);

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
    getCourseData: (id) => dispatch(getCourseData(id)),
    makeRequestDescription: () => dispatch(makeRequestDescription()),
    updateCourses: (data) => dispatch(updateCourses(data)),
    setRequirements: (data) => dispatch(setRequirements(data)),
    setUnits: (data) => dispatch(setUnits(data)),
    setDepartment: (data) => dispatch(setDepartment(data)),
    setLevel: (data) => dispatch(setLevel(data)),
    setSemester: (data) => dispatch(setSemester(data)),
  };
};

const mapStateToProps = (state) => {
  const { loading, courseData, filterMap } = state.classDescription;
  const { requirements, units, department, level, semester } = state.filter;
  return {
    loading,
    courseData,
    filterMap,
    requirements,
    units,
    department,
    level,
    semester,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ClassDescription));
