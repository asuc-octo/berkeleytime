import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Grid, Row, Col } from 'react-bootstrap';

// import {Card} from '../../components/Card/Card.jsx';
import ClassCard from '../../components/ClassCard/ClassCard.jsx';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';

import {
  enrollment,
  optionsEnrollment,
  responsiveEnrollment
} from '../../variables/Variables';

class Enrollment extends Component {
  constructor(props) {
    super(props)
    this.state = { classCards: Enrollment.defaultProps.classCards }
    this.removeClass = this.removeClass.bind(this)
  }

  removeClass(classNum) {
    this.setState({ classCards: this.state.classCards.filter(classInfo => classInfo.classNum != classNum) })
  }

  getCurrentDate() {
    var today = new Date();
    return today.toString().slice(4, 15);
  }

  render() {
    const { classCards } = this.state;
    return (
      <div className="app-container">
        <div className="columns">
          {classCards.map(item => (
            <div className="column card-column">
              <ClassCard
                stripeColor={item.stripeColor}
                classNum={item.classNum}
                semester={item.semester}
                faculty={item.faculty}
                title={item.title}
                removeClass={this.removeClass}
              />
            </div>
          ))}
        </div>
        <GraphCard
          id="chartHours"
          title="Enrollment"
          semester="Spring 2018"
          graph={(
            <LineChart width={600} height={245} data={enrollment}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="percent" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          )}
          info={(
            <EnrollmentInfoCard
              classNum="CS 61A"
              semester="Spring 2018"
              faculty="Denero"
              title="The Structure and Interpretation of Computer Programs"
              day="88"
              adjustmentPercent="44"
              adjustmentEnrolled="8/18"
              adjustmentWaitlisted="0"
              today={this.getCurrentDate()}
              todayPercent="100"
              todayEnrolled="12/18"
              todayWaitlisted="0"
            />
          )}
        />
      </div>
    );
  }
}
Enrollment.defaultProps = {
  classCards: [
    {
      stripeColor:'#4EA6FB',
      classNum:"CS 61A",
      semester:"Spring 2018",
      faculty:"Denero",
      title:"The Structure and Interpretation of Computer Programs"
    }, {
      stripeColor:"#6AE086",
      classNum:"Math 1A",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"Single Variable Calculus"
    }, {
      stripeColor:"#ED5186",
      classNum:"English 43B",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"Introduction to the Art of Verse"
    }, {
      stripeColor:"#F9E152",
      classNum:"Art 18",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"The Language of Painting"
    }
  ]
};

export default Enrollment;
