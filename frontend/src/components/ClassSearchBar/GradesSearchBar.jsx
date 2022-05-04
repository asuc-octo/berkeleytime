import _ from "lodash";
import React, { Component } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";
import Select from "react-select-virtualized";
import { reactSelectCourseSearch } from "utils/courses/search";

import { fetchContextClasses, fetchContextCourses } from "redux/actions";

class GradesSearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectCourse: null,
      selectSemester: null,
      selectInstructor: null,
    };

    this.handleCourse = this.handleCourse.bind(this);
    this.handleSemester = this.handleSemester.bind(this);
    this.handleInstructor = this.handleInstructor.bind(this);
  }

  componentDidMount() {
    const { fetchContextCourses } = this.props;
    fetchContextCourses();
  }

  handleCourse(course) {
    const { fetchContextClasses } = this.props;
    fetchContextClasses(course.value);
    this.setState({
      ...this.state,
      selectCourse: course,
      selectSemester: null,
      selectInstructor: null,
    });
  }

  handleSemester(semester) {
    this.setState({
      ...this.state,
      selectSemester: semester,
      selectInstructor: null,
    });
  }

  handleInstructor(instructor) {
    this.setState({
      ...this.state,
      selectInstructor: instructor,
    });
  }

  addSelected() {
    const { selectCourse, selectSemester, selectInstructor } = this.state;
  }

  render() {
    const { isFull, isMobile, sis_classes, sis_courses } = this.props;
    const { selectCourse, selectInstructor, selectSemester } = this.state;
    const customStyles = {
      clearIndicator: (provided, state) => ({
        ...provided,
        marginRight: 0,
        paddingRight: 0,
      }),
    };

    let optionsSemester = [];
    const semesterSet = new Set();
    for (const sis_class of sis_classes) {
      for (const sis_section of sis_class._sections) {
        for (const calanswers_grade of sis_section._grades) {
          const term = `${calanswers_grade.term.year} ${calanswers_grade.term.semester}`;
          if (!semesterSet.has(term)) {
            semesterSet.add(term);
            optionsSemester.push({
              value: term,
              label: term,
              calanswers_grade,
            });
          }
        }
      }
    }
    optionsSemester = _.orderBy(
      optionsSemester,
      [
        (o) => o.calanswers_grade.term.year,
        (o) => o.calanswers_grade.term.month,
      ],
      ["desc", "desc"]
    );

    let optionsInstructor = [];
    const n = new Set();
    for (const sis_class of sis_classes) {
      for (const sis_section of sis_class._sections) {
        // only list lecture sections
        if (sis_section?.association?.primary) {
          for (const calanswers_grade of sis_section._grades) {
            for (const instructorName of calanswers_grade.InstructorName) {
              if (
                selectSemester?.value ==
                `${calanswers_grade.term.year} ${calanswers_grade.term.semester}`
              ) {
                if (!n.has(`${instructorName} - ${sis_section.displayName}`)) {
                  n.add(`${instructorName} - ${sis_section.displayName}`);
                  optionsInstructor.push({
                    value: `${sis_section.component.code} ${sis_section.number} - ${instructorName}`,
                    label: `${sis_section.component.code} ${sis_section.number} - ${instructorName}`,
                    instructorName,
                    sis_class,
                    sis_section,
                    calanswers_grade,
                  });
                }
              }
            }
          }
        }
      }
    }
    optionsInstructor = _.chain(optionsInstructor)
      .filter((o) => !o.instructorName.startsWith("-"))
      .orderBy([(o) => o.label], ["asc"])
      .value();

    return (
      <Container fluid className="grades-search-bar">
        <Row style={{ marginBottom: 10 }}>
          <Col lg={2}>
            <Select
              name="course"
              placeholder="Choose a course..."
              value={selectCourse}
              options={sis_courses.map((course) => ({
                value: course,
                label: course,
              }))}
              onChange={this.handleCourse}
              filterOption={reactSelectCourseSearch}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={2}>
            <Select
              name="semester"
              placeholder={!isMobile ? "Select a semester..." : "Select..."}
              value={selectSemester}
              options={optionsSemester}
              onChange={this.handleSemester}
              isDisabled={!selectCourse}
              isClearable={false}
              searchable={false}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Select
              name="instructor"
              placeholder={!isMobile ? "Select an instructor..." : "Select..."}
              value={selectInstructor}
              options={optionsInstructor}
              onChange={this.handleInstructor}
              isDisabled={!selectCourse}
              isClearable={false}
              searchable={false}
              components={{
                IndicatorSeparator: () => null,
              }}
              styles={customStyles}
            />
          </Col>
          <Col xs={12} sm={12} lg={1}>
            <Button
              onClick={() => {}}
              disabled={
                !selectCourse || !(selectSemester && selectInstructor) || isFull
              }
            >
              Add Class
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  const { sis_classes, sis_courses } = state.context;
  return {
    sis_classes,
    sis_courses,
  };
};

export default connect(mapStateToProps, {
  fetchContextClasses,
  fetchContextCourses,
})(GradesSearchBar);
