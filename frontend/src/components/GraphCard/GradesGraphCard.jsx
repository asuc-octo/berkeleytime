import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';

import vars from '../../variables/Variables';

import GradesGraph from '../Graphs/GradesGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard.jsx';

class GradesGraphCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      gradesData: [],
      graphData: [],

      hoveredClass: false,
    };

    this.updateBarHover = this.updateBarHover.bind(this);
    this.updateGraphHover = this.updateGraphHover.bind(this);
    this.getGradesData = this.getGradesData.bind(this);
    this.buildGraphData = this.buildGraphData.bind(this);
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
    const { classData } = this.props;
    let promises = [];

    for(let course of classData) {
      let { sections } = course;
      let url = `http://localhost:8080/api/grades/sections/${sections.join('&')}/`;

      promises.push(axios.get(url));
    }

    axios.all(promises).then(data => {
      let gradesData = data.map((res, i) => {
        let gradesData = res.data;
        gradesData['id'] = classData[i].id;
        gradesData['instructor'] = classData[i].instructor == 'all' ? 'All Instructors' : classData[i].instructor;
        gradesData['semester'] = classData[i].semester == 'all' ? 'All Semesters' : classData[i].semester;
        return gradesData
      })

      this.setState({
        gradesData: gradesData,
        graphData: this.buildGraphData(gradesData),
      })
    })
  }

  buildGraphData(gradesData) {
    const graphData = vars.possibleGrades.map(letterGrade => {
      let ret = {
        name: letterGrade,
      };

      for(let grade of gradesData) {
        //ret[grade.id] = grade[letterGrade].percent * 100
        ret[grade.id] = grade[letterGrade].numerator / grade.denominator * 100;
      }

      return ret
    })

    return graphData;
  }

  update(course, grade) {
    const { gradesData } = this.state;
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

  // getNeighborGrade(direction) {
  //   const gradeIdx = vars.possibleGrades.indexOf(this.state.selectedGradeName);
  //   if (direction == "better" && gradeIdx != 0){
  //     return this.state.classData[this.state.lastSelectedClassID][vars.possibleGrades[gradeIdx-1]];
  //   } else if (direction == "worse" && gradeIdx != vars.possibleGrades.length){
  //     return this.state.classData[this.state.lastSelectedClassID][vars.possibleGrades[gradeIdx+1]];
  //   } return null;
  // }

  render () {
    let { graphData, gradesData, hoveredClass } = this.state;
    let { title } = this.props;

    var colorIndex = 0;
    for (var i = 0; i < gradesData.length; i++) {
      if (gradesData[i].id === hoveredClass.id) {
        colorIndex = i;
        break;
      }
    }
    let hoveredColor = vars.colors[colorIndex];

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

export default GradesGraphCard;
