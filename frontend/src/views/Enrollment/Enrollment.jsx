import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

import {
  enrollment,
  optionsEnrollment,
  responsiveEnrollment
} from '../../variables/Variables';

class Enrollment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      context: {},
      selectedCourses: [],
    }

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this)
  }

  componentDidMount() {
    axios.get('/api/enrollment_json/')
    .then(res => {
      console.log(res);
      this.setState({
        context: res.data,
      })
    })
    .catch((err) => {
      if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
      }
      console.log(err.config);
    });
  }

  addCourse(course) {
    console.log(course);
    this.setState(prevState => ({
      selectedCourses: [...prevState.selectedCourses, course],
    }));
  }

  removeCourse(classNum) {
    this.setState((prevState, props) => ({
      classCards: prevState.classCards.filter(classInfo => classInfo.classNum !== classNum)
    }));
  }

  getCurrentDate() {
    var today = new Date();
    return today.toString().slice(4, 15);
  }

  render() {
    const { context, selectedCourses } = this.state;
    let courses = context.courses;

    console.log(selectedCourses);

    return (
      <div className="app-container">
        {courses &&
          <ClassSearchBar
            classes={courses}
            addCourse={this.addCourse}
          />
        }
        {selectedCourses.length > 0 &&
          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
          />
        }
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

export default Enrollment;
