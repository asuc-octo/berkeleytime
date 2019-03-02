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

import vars from '../../variables/Variables';

import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';


class GraphCard extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      title: "",

      // data for class selected by user
      classData: [],

      // bar in graph that user last hovered over

      selectedGrade: {},

      graphData: [
        {name: 'A+'},
        {name: 'A'},
        {name: 'A-'},
        {name: 'B+'},
        {name: 'B'},
        {name: 'B-'},
        {name: 'C+'},
        {name: 'C'},
        {name: 'C-'},
        {name: 'D'},
        {name: 'F'},
        {name: 'NP'},
        {name: 'P'}]
  }

  // reformat json response to rechart format
  morphGraphData(json) {
    const graphData = this.state.graphData;
    let course_id;
    for (const thisClass in json) {
      course_id = thisClass[course_id];
      for (const i in graphData.length) {
        graphData[i][course_id] = thisClass[graphData[i]["name"]["numerator"]]
      }
    }
    
    this.setState({
        graphData: graphData,
        classData: json[0]
      });
  }

  updateGradeInfo(e) {
    console.log(e);
    console.log(vars.possibleGrades);
  }
  

  render () {
    if (this.state.title == "" || graphData.length == 0) {
      return (
        <div className="card card-graph">
          <h1>Select a Class</h1>
        </div>
      );
    }
    return (
      <div className="card card-graph">
        <Row className="content">
          <div className="graphTitle">{ title }</div>
        </Row>
        <Row>
          <Col sm={8}>
            <div className="graph">
              <BarChart width={600} height={245} data={graphData.data}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />

              {graphData.datakeys.map((item, index) => (
                <Bar dataKey={item} 
                fill={vars.colors[index%vars.colors.length]}
                onMouseEnter={this.updateGradeInfo}
                />
              ))}

              </BarChart>
            </div>
          </Col>

          <Col sm={4}>
            <GradesInfoCard
                classNum = {this.state.classData.classNum}
                semester = {this.state.classData.semester}
                faculty = {this.state.classData.faculty}
                title = {this.state.classData.title}
                courseAvg = {this.state.classData.courseAvg}
                courseGPA = {this.state.classData.courseGPA}
                sectionAvg = {this.state.classData.sectionAvg}
                sectionGPA = {this.state.classData.sectionGPA}
            


                selectedGrade = {this.state.selectedGrade}
                betterGrade = {this.getNeighborGrade("better")}
                worseGrade = {this.getNeighborGrade("worse")}
              />
          </Col>
        </Row>
      </div>
    );
  }
}
