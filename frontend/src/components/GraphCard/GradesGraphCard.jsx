import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";

import { connect } from "react-redux";
import vars from "../../variables/Variables";

import GradesGraph from "../Graphs/GradesGraph";
import GraphEmpty from "../Graphs/GraphEmpty";
import GradesInfoCard from "../GradesInfoCard/GradesInfoCard";

import { fetchGradeData } from "../../redux/actions";

class GradesGraphCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredClass: false,
      updateMobileHover: true,
    };

    this.updateBarHover = this.updateBarHover.bind(this);
    this.updateGraphHover = this.updateGraphHover.bind(this);
  }

  componentDidMount() {
    this.getGradesData();
  }

  componentDidUpdate(prevProps) {
    const { selectedCourses, gradesData } = this.props;
    if (selectedCourses !== prevProps.selectedCourses) {
      this.getGradesData();
    }
    if (
      gradesData !== prevProps.gradesData &&
      gradesData.length > 0 &&
      selectedCourses.length === 1
    ) {
      this.update(selectedCourses[0], 0);
    }

    const course_letter = gradesData.map((course) => course.course_letter);
    const course_gpa = gradesData.map((course) => course.course_gpa);
    const section_letter = gradesData.map((course) => course.section_letter);
    const section_gpa = gradesData.map((course) => course.section_gpa);
    this.props.updateClassCardGrade(
      course_letter,
      course_gpa,
      section_letter,
      section_gpa
    );
  }

  getGradesData() {
    const { selectedCourses, fetchGradeData } = this.props;
    fetchGradeData(selectedCourses);
  }

  update(course, grade) {
    const { gradesData } = this.props;
    if (course && gradesData && gradesData.length > 0) {
      const selectedGrades = gradesData.filter((c) => course.id === c.id)[0];
      const hoverTotal = {
        ...course,
        ...selectedGrades,
        hoverGrade: grade,
      };

      this.setState({
        hoveredClass: hoverTotal,
      });
    }
  }

  // Handler function for updating GradesInfoCard on hover
  updateBarHover(barData) {
    const { selectedCourses } = this.props;
    const { payload, name, value } = barData;

    let selectedClassID = "";
    for (const key in payload) {
      if (payload[key] === value) {
        selectedClassID = key;
      }
    }

    const selectedCourse = selectedCourses.filter(
      (course) => selectedClassID === course.id
    )[0];
    this.update(selectedCourse, name);

    this.setState({ updateMobileHover: false });
  }

  // Handler function for updating GradesInfoCard on hover with single course
  updateGraphHover(data) {
    const { isTooltipActive, activeLabel } = data;
    const { selectedCourses } = this.props;

    const noBarMobile = this.state.updateMobileHover && this.props.isMobile;

    // Update the selected course if no bar is clicked if in mobile
    if (isTooltipActive && (selectedCourses.length === 1 || noBarMobile)) {
      const selectedCourse = selectedCourses[0];
      const grade = activeLabel;
      this.update(selectedCourse, grade);
    }

    // Update mobile hover records if there actually is a bar (then we only want updateBarHover to run)
    this.setState({ updateMobileHover: true });
  }

  render() {
    const { hoveredClass } = this.state;
    const { graphData, gradesData, selectedCourses, isMobile } = this.props;
    const graphEmpty = gradesData.length === 0 || selectedCourses.length === 0;

    return (
      <div className="grades-graph">
        <Container fluid>
          <Row>
            <Col
              xs={{ span: 12, order: 2 }}
              sm={{ span: 12, order: 2 }}
              md={{ span: 8, order: 1 }}
              lg={{ span: 8, order: 1 }}
            >
              {isMobile && (
                <div className="grades-mobile-heading">
                  {" "}
                  Grade Distribution{" "}
                </div>
              )}
              <GradesGraph
                graphData={graphData}
                gradesData={gradesData}
                updateBarHover={this.updateBarHover}
                updateGraphHover={this.updateGraphHover}
                course={hoveredClass.course}
                semester={
                  hoveredClass.semester === "all"
                    ? "All Semesters"
                    : hoveredClass.semester
                }
                instructor={
                  hoveredClass.instructor === "all"
                    ? "All Instructors"
                    : hoveredClass.instructor
                }
                selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
                denominator={hoveredClass.denominator}
                color={vars.colors[hoveredClass.colorId]}
                isMobile={this.props.isMobile}
                graphEmpty={graphEmpty}
              />
            </Col>

            {graphEmpty && (
              <Col
                xs={{ span: 12, order: 1 }}
                sm={{ span: 12, order: 1 }}
                md={{ span: 4, order: 2 }}
                lg={{ span: 4, order: 2 }}
              >
                <GraphEmpty pageType="grades" />
              </Col>
            )}

            {!isMobile && !graphEmpty && (
              <Col md={{ span: 4, order: 2 }} lg={{ span: 4, order: 2 }}>
                {hoveredClass && (
                  <GradesInfoCard
                    course={hoveredClass.course}
                    subtitle={hoveredClass.subtitle}
                    semester={
                      hoveredClass.semester === "all"
                        ? "All Semesters"
                        : hoveredClass.semester
                    }
                    instructor={
                      hoveredClass.instructor === "all"
                        ? "All Instructors"
                        : hoveredClass.instructor
                    }
                    courseLetter={hoveredClass.course_letter}
                    courseGPA={hoveredClass.course_gpa}
                    sectionLetter={hoveredClass.section_letter}
                    sectionGPA={hoveredClass.section_gpa}
                    denominator={hoveredClass.denominator}
                    selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
                    selectedGrade={hoveredClass.hoverGrade}
                    color={vars.colors[hoveredClass.colorId]}
                  />
                )}
              </Col>
            )}
          </Row>
        </Container>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  fetchGradeData: (selectedCourses) =>
    dispatch(fetchGradeData(selectedCourses)),
});

const mapStateToProps = (state) => {
  const { gradesData, graphData, selectedCourses } = state.grade;
  return {
    gradesData,
    graphData,
    selectedCourses,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GradesGraphCard);
