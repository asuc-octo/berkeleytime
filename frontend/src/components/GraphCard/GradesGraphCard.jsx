import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';

import vars from '../../variables/Variables';

import GradesGraph from '../Graphs/GradesGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard.jsx';

import { fetchGradeData } from '../../redux/actions';
import { connect } from "react-redux";

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
    let selectedGrades = gradesData.filter(c => course.id == c.id)[0];

    let hoverTotal = {
      ...course,
      ...selectedGrades,
      hoverGrade: grade,
    }

    this.setState({
      hoveredClass: hoverTotal,
    })
  }

  // Handler function for updating GradesInfoCard on hover
  updateBarHover(barData) {
    const { classData } = this.props;
    const {payload, name, value} = barData;

    let selectedClassID = '';
    for (let key in payload) {
      if (payload[key] == value) {
        selectedClassID = key;
      }
    }

    let selectedCourse = classData.filter(course => selectedClassID == course.id)[0]
    this.update(selectedCourse, name);
  }

  // Handler function for updating GradesInfoCard on hover with single course
  updateGraphHover(data) {
    let {isTooltipActive, activeLabel} = data;
    const { classData } = this.props;

    if(isTooltipActive && classData.length == 1) {
      let selectedCourse = classData[0];
      let grade = activeLabel;
      this.update(selectedCourse, grade);
    }
  }

  render () {
    let { hoveredClass } = this.state;
    const { graphData, gradesData } = this.props;
    let { title } = this.props;

    var colorIndex = 0;
    for (var i = 0; i < gradesData.length; i++) {
      if (gradesData[i].id === hoveredClass.id) {
        colorIndex = i;
        break;
      }
    }
    let hoveredColor = vars.colors[hoveredClass.colorId];

    return (
      <div className="card grades-graph-card">
        <div className="grades-graph">
          {
            gradesData.length === 0 ? (
              <GraphEmpty pageType='grades'/>
            ) : (
              <div className="graph-content">
                <Row>
                  <div className="graph-title">{ title }</div>
                </Row>
                <Row>
                  <Col sm={8}>
                    <GradesGraph
                      graphData={graphData}
                      gradesData={gradesData}
                      updateBarHover={this.updateBarHover}
                      updateGraphHover={this.updateGraphHover}
                    />
                  </Col>

                  <Col sm={4}>
                    {hoveredClass &&
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
                        selectedGrade={hoveredClass[hoveredClass.hoverGrade]}
                        gradeName={hoveredClass.hoverGrade}
                        hoveredColor={hoveredColor}

                        // selectedGrade = {this.state.selectedGrade}
                        // betterGrade = {this.getNeighborGrade("better")}
                        // worseGrade = {this.getNeighborGrade("worse")}
                      />
                    }
                  </Col>
                </Row>
              </div>
            )
          }
        </div>
      </div>
    );
  }

}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    fetchGradeData: (classData) => dispatch(fetchGradeData(classData)),
  }
}

const mapStateToProps = state => {
  const { gradesData, graphData } = state.grade;
  return {
    gradesData,
    graphData
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GradesGraphCard);
