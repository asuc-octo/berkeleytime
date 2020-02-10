import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { connect } from 'react-redux';
import vars from '../../variables/Variables';

import GradesGraph from '../Graphs/GradesGraph';
import GraphEmpty from '../Graphs/GraphEmpty';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';

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
    const { classData } = this.props;
    if (classData !== prevProps.classData) {
      this.getGradesData();
    }
  }

  getGradesData() {
    const { classData, fetchGradeData } = this.props;
    fetchGradeData(classData);
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
  }

  // Handler function for updating GradesInfoCard on hover
  updateBarHover(barData) {
    const { classData } = this.props;
    const { payload, name, value } = barData;

    let selectedClassID = '';
    for (const key in payload) {
      if (payload[key] == value) {
        selectedClassID = key;
      }
    }

    const selectedCourse = classData.filter(course => selectedClassID == course.id)[0];
    this.update(selectedCourse, name);
  }

  // Handler function for updating GradesInfoCard on hover with single course
  updateGraphHover(data) {
    const { isTooltipActive, activeLabel } = data;
    const { classData } = this.props;

    if (isTooltipActive && classData.length == 1) {
      const selectedCourse = classData[0];
      const grade = activeLabel;
      this.update(selectedCourse, grade);
    }
  }

  render() {
    const { hoveredClass } = this.state;
    const { graphData, gradesData } = this.props;

    let colorIndex = 0;
    for (let i = 0; i < gradesData.length; i++) {
      if (gradesData[i].id === hoveredClass.id) {
        colorIndex = i;
        break;
      }
    }
    const hoveredColor = vars.colors[colorIndex];

    return (
      <div className="grades-graph">
        {
          gradesData.length === 0 ? (
            <GraphEmpty pageType="grades" />
          ) : (
            <Container fluid>
              <Row>
                <Col lg={8}>
                  <GradesGraph
                    graphData={graphData}
                    gradesData={gradesData}
                    updateBarHover={this.updateBarHover}
                    updateGraphHover={this.updateGraphHover}
                  />
                </Col>

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
                        color={hoveredColor}
                      />
                    )}
                </Col>
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
  fetchGradeData: (classData) => dispatch(fetchGradeData(classData)),
});

const mapStateToProps = state => {
  const { gradesData, graphData } = state.grade;
  return {
    gradesData,
    graphData,
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GradesGraphCard);
