import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { connect } from 'react-redux';
import vars from '../../variables/Variables';

import GradesGraph from '../Graphs/GradesGraph';
import GraphEmpty from '../Graphs/GraphEmpty';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';
import GradesInfoCardMobile from '../GradesInfoCard/GradesInfoCardMobile';

import { fetchGradeData } from '../../redux/actions';

class GradesGraphCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredClass: false,
    };

    this.updateBarHover = this.updateBarHover.bind(this);
    this.updateGraphHover = this.updateGraphHover.bind(this);
    this.getGradesData = this.getGradesData.bind(this);
  }

  componentDidMount() {
    this.getGradesData();
  }

  componentDidUpdate(prevProps) {
    const { selectedCourses, gradesData } = this.props;
    if (selectedCourses !== prevProps.selectedCourses) {
      this.getGradesData();
    }
    if (gradesData !== prevProps.gradesData && gradesData.length > 0) {
      this.update(selectedCourses[0], null)
    }
  }

  getGradesData() {
    const { selectedCourses, fetchGradeData } = this.props;
    fetchGradeData(selectedCourses);
  }

  update(course, grade) {
    const { gradesData } = this.props;
    const selectedGrades = gradesData.filter(c => course.id == c.id)[0];

    const hoverTotal = {
      ...course,
      ...selectedGrades,
      hoverGrade: grade,
    };

    this.setState({
      hoveredClass: hoverTotal,
    });

    this.props.updateSharedHoveredClass(hoverTotal);
  }

  // Handler function for updating GradesInfoCard on hover
  updateBarHover(barData) {
    const { selectedCourses } = this.props;
    const { payload, name, value } = barData;

    let selectedClassID = '';
    for (const key in payload) {
      if (payload[key] == value) {
        selectedClassID = key;
      }
    }

    const selectedCourse = selectedCourses.filter(course => selectedClassID == course.id)[0];
    this.update(selectedCourse, name);
  }

  // Handler function for updating GradesInfoCard on hover with single course
  updateGraphHover(data) {
    const { isTooltipActive, activeLabel } = data;
    const { selectedCourses } = this.props;

    if (isTooltipActive && selectedCourses.length == 1) {
      const selectedCourse = selectedCourses[0];
      const grade = activeLabel;
      this.update(selectedCourse, grade);
    }
  }

  render() {
    const { hoveredClass } = this.state;
    const { graphData, gradesData, selectedCourses, isMobile } = this.props;


    return (
      <div className="grades-graph">
        {
          gradesData.length === 0 || selectedCourses.length === 0 ? (
            <GraphEmpty pageType="grades" />
          ) : (
            <Container fluid>
              <Row>

                {/*this.props.isMobile ?
                <Col lg={4}>
                  <GradesInfoCardMobile
                    course={hoveredClass.course}
                    subtitle={hoveredClass.subtitle}
                    semester={hoveredClass.semester === 'all' ? 'All Semesters' : hoveredClass.semester}
                    instructor={hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor}
                    courseLetter={hoveredClass.course_letter}
                    courseGPA={hoveredClass.course_gpa}
                    sectionLetter={hoveredClass.section_letter}
                    sectionGPA={hoveredClass.section_gpa}
                    denominator={hoveredClass.denominator}
                    selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
                    selectedGrade={hoveredClass.hoverGrade}
                    color={vars.colors[hoveredClass.colorId]}
                  />
                </Col> : null*/}

                <Col lg={8}>
                  <GradesGraph
                    graphData={graphData}
                    gradesData={gradesData}
                    updateBarHover={this.updateBarHover}
                    updateGraphHover={this.updateGraphHover}
                    selectedPercentiles={hoveredClass[hoveredClass.hoverGrade]}
                    denominator={hoveredClass.denominator}
                    color={vars.colors[hoveredClass.colorId]}
                    isMobile={this.props.isMobile}
                  />
                </Col>

                {!this.props.isMobile ?
                <Col lg={4}>
                  {hoveredClass
                    && (
                      <GradesInfoCard
                        course={hoveredClass.course}
                        subtitle={hoveredClass.subtitle}
                        semester={hoveredClass.semester === 'all' ? 'All Semesters' : hoveredClass.semester}
                        instructor={hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor}
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
                </Col> : null}
              </Row>
            </Container>
          )
        }
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchGradeData: (selectedCourses) => dispatch(fetchGradeData(selectedCourses)),
});

const mapStateToProps = state => {
  const { gradesData, graphData, selectedCourses } = state.grade;
  return {
    gradesData,
    graphData,
    selectedCourses
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GradesGraphCard);
