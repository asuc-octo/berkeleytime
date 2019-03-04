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
    // data for class selected by user
    //classData: [] //read-only; passed from parent

    this.state = { 
      // data for all classes selected by user
      // dictionary mapping section_id to grades
      classData: {},
      graphDataKeys: [], //keys for diff class; essentially keys from classData

      // bar in graph that user last hovered over
      selectedGrade: {},
      lastAddedClassID: "",

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
        {name: 'P'}
      ]
    }
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.classData !== prevProps.classData) {
      this.morphGraphData(this.props.classData);
    }
  }

  // reformat new json response (for 1 class) to rechart format
  // and update state
  morphGraphData(newClass) {
    // add newclass to allclassdata
    const newClassData = this.state.classData;
    const course_id = newClass["course_id"]
    newClassData[course_id] = newClass;

    const newGraphData = this.state.graphData;
    
    var i;
    for (i = 0; i < newGraphData.length; i++) {
      newGraphData[i][course_id] = newClass[newGraphData[i]["name"]]["numerator"];

    }
    
    this.setState({
        classData: newClassData,
        graphData: newGraphData,
        graphDataKeys: Object.keys(newClassData),
        lastAddedClassID: course_id,
        selectedGrade: newClassData[course_id]["A"]
      });
  }


  updateGradeInfo(e) {
    console.log(e);
    console.log(vars.possibleGrades);
    // reformat into 
    /*
    {"grade_name": "F",
        "percentile_low": 0,
        "percent": 0.04,
        "percentile_high": 0.04,
        "numerator": 139
    },

    */
  }
  
  getNeighborGrade(direction) {
    return {
      "grade_name": "F",
      "percentile_low": 0,
      "percent": 0.04,
      "percentile_high": 0.04,
      "numerator": 139
    }
  }

  render () {
    console.log(this.props);
    console.log(this.state);
    console.log(this.state.selectedGrade);
    if (Object.keys(this.props.classData).length == 0 || Object.keys(this.state.classData).length == 0) {
      return (
        <div className="card card-graph">
          <h1>Select a Class</h1>
        </div>
      );
    }
    return (
      <div className="card card-graph">
        <Row className="content">
          <div className="graphTitle">{ this.props.title }</div>
        </Row>
        <Row>
          <Col sm={8}>
            <div className="graph">
              <BarChart width={600} height={245} data={this.state.graphData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />

              {this.state.graphDataKeys.map((item, index) => (
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
                thisClass={this.state.classData[this.state.lastAddedClassID]}

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

export default GraphCard;