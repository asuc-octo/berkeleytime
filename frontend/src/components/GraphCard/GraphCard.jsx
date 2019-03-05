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
      // data for all classes added by user
      // dictionary mapping section_id to grades
      classData: {},
      graphDataKeys: [], //keys for diff class; essentially keys from classData

      // bar in graph that user last hovered over
      selectedGrade: {},
      selectedGradeName: "", // name of grade
      lastSelectedClassID: "",  // id of class last selected

      // data for recharts
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
      ],
    },
    this.updateHoverGrade = this.updateHoverGrade.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.classData !== prevProps.classData) {
      this.morphGraphData(this.props.classData);
    }
  }

  // reformat new json response (for 1 class) to rechart format
  // and update state
  morphGraphData(newClass) {
    // add newclass to allclassdata
    const newClassData = this.state.classData;
    const section_id = newClass["section_id"]
    newClassData[section_id] = newClass;

    var newGraphData = this.state.graphData;
    
    // add newclass to graphData
    var i;
    for (i = 0; i < newGraphData.length; i++) {
      newGraphData[i][section_id] = newClass[newGraphData[i]["name"]]["numerator"];
    }
    
    this.setState({
        classData: newClassData,
        graphData: newGraphData,
        graphDataKeys: Object.keys(newClassData),
        lastSelectedClassID: section_id,
        selectedGrade: newClassData[section_id]["A"]
      });
  }

  //update graphinfocard w the bar that was last hovered
  updateHoverGrade(e) { 
    console.log(e);
    var selectedClass;
    const payLoadKeys = Object.keys(e.payload);
    for (var i in payLoadKeys) {
      if (e.payload[payLoadKeys[i]] == e.value) {
        selectedClass = payLoadKeys[i];
      }
    }
    this.setState({
      selectedGrade: this.state.classData[selectedClass][e.name],
      lastSelectedClassID: selectedClass,
      selectedGradeName: e.name
    });

  }
  
  getNeighborGrade(direction) {
    const gradeIdx = vars.possibleGrades.indexOf(this.state.selectedGradeName);
    if (direction == "better" && gradeIdx != 0){
      return this.state.classData[this.state.lastSelectedClassID][vars.possibleGrades[gradeIdx-1]];
    } else if (direction == "worse" && gradeIdx != vars.possibleGrades.length){
      return this.state.classData[this.state.lastSelectedClassID][vars.possibleGrades[gradeIdx+1]];
    } return null;
  }

  render () {
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
                onMouseEnter={this.updateHoverGrade}
                />
              ))}

              </BarChart>
            </div>
          </Col>

          <Col sm={4}>
            <GradesInfoCard
                thisClass={this.state.classData[this.state.lastSelectedClassID]}

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