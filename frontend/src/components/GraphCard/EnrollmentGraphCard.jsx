import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import vars from '../../variables/Variables';

import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';

class EnrollmentGraphCard extends Component {
  constructor(props) {
    super(props)
    
    this.state = { 
      // data for all classes added by user
      // dictionary mapping section_id to grades
      classData: {},
      graphDataKeys: [], //keys for diff class; essentially keys from classData

      // point on graph that user last hovered over
      selectedPoint: {},
      lastSelectedClassID: "",  // id of class last selected

      // data for recharts
      graphData: [],
    },
    this.updateHoverGrade = this.updateHoverGrade.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.classData !== prevProps.classData) {
      this.morphGraphData(this.props.classData);
    }
  }

  // reformat new json response (for 1 class) to rechart format and update state
  morphGraphData(newClass) {
    // add newclass to allclassdata
    const newClassData = this.state.classData;
    const section_id = newClass["course_id"] + newClass["section_id"];
    newClassData[section_id] = newClass;

    var newGraphData = this.state.graphData;
    
    // add newclass to graphData
    var i;
    for (i = 0; i < newClass["data"].length; i++) {
      if (newClass[i]["day"] < 0) {
        continue;
      } 
      if (newGraphData.length < i) {
        newGraphData.push({
          day: newClass[i]["day"],
          section_id: newClass[i]["enrolled"]
        });    
      } else {
        newGraphData[i][section_id] = newClass[i]["enrolled"];
      }
      
    } 
    
    this.setState({
        classData: newClassData,
        graphData: newGraphData,
        graphDataKeys: Object.keys(newClassData),
        lastSelectedClassID: section_id,
        selectedPoint: newClassData[section_id][newGraphData.length-1]
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
  
  getCurrentDate() {
    let today = new Date();
    return today.toString().slice(4, 15);
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
              <LineChart width={600} height={245} data={this.state.graphData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                {this.state.graphDataKeys.map((item, index) => (
                  <Line type="monotone" dataKey={item} 
                  stroke="#8884d8" activeDot={{ r: 8 }}
                  onMouseEnter={this.updateHoverGrade}
                  />
                ))}                
              </LineChart>
            </div>
          </Col>

          <Col sm={4}>
            <EnrollmentInfoCard
                thisClass={this.state.classData[this.state.lastSelectedClassID]}

                selectedPt = {this.state.selectedPt}
                today={this.getCurrentDate()}
              />
          </Col>
        </Row>
      </div>
    );
  }

}

export default EnrollmentGraphCard;