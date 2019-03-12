import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axios from 'axios';

import vars from '../../variables/Variables';

import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';

class GraphCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      gradesData: [],
      graphData: [],

      hoveredClass: false,
    },

    this.updateInfoCard = this.updateInfoCard.bind(this);
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
      let apiString = `/api/grades/sections/${sections.join('&')}/`;

      promises.push(axios.get(apiString));
    }

    axios.all(promises).then(data => {
      let gradesData = data.map((res, i) => {
        let gradesData = res.data;
        gradesData['id'] = classData[i].id;
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
        ret[grade.id] = grade[letterGrade].percent * 100
      }

      return ret
    })

    return graphData;
  }

  //update graphinfocard w the bar that was last hovered
  updateInfoCard(barData) {
    console.log(barData);

    const { gradesData } = this.state;
    const { classData } = this.props;

    let selectedClassID = '';
    const payload = barData.payload;
    for (let key in payload) {
      if (payload[key] == barData.value) {
        selectedClassID = key;
      }
    }

    let selectedCourse = classData.filter(course => selectedClassID == course.id)[0]
    let selectedGrades = gradesData.filter(course => selectedClassID == course.id)[0]

    let hoverTotal = {
      ...selectedCourse,
      ...selectedGrades,
      hoverGrade: barData.name,
    }

    console.log(hoverTotal);

    this.setState({
      hoveredClass: hoverTotal,
    })
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

    return (
      <div className="card card-graph">
        {
          gradesData.length == 0 ?(
            <h1>Select a Class</h1>
          ) : (
          <div className="graph">
            <Row className="content">
              <div className="graphTitle">{ this.props.title }</div>
            </Row>
            <Row>
              <Col sm={8}>
                <div className="graph">
                  <BarChart width={800} height={400} data={graphData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />

                  {gradesData.map((item, index) => (
                    <Bar
                      dataKey={item.id}
                      fill={vars.colors[index % vars.colors.length]}
                      onMouseEnter={this.updateInfoCard}
                    />
                  ))}

                  </BarChart>
                </div>
              </Col>

              <Col sm={4}>
                {hoveredClass &&
                  <GradesInfoCard
                    course={hoveredClass.course}
                    title={hoveredClass.title}
                    semester={hoveredClass.semester == 'all' ? 'All Semester' : hoveredClass.semester}
                    instructor={hoveredClass.instructor == 'all' ? 'All Instructors' : hoveredClass.instructor}
                    courseLetter={hoveredClass.course_letter}
                    courseGPA={hoveredClass.course_gpa}
                    sectionLetter={hoveredClass.section_letter}
                    sectionGPA={hoveredClass.section_gpa}
                    denominator={hoveredClass.denominator}
                    selectedGrade={hoveredClass[hoveredClass.hoverGrade]}
                    gradeName={hoveredClass.hoverGrade}

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
    );
  }

}

export default GraphCard;