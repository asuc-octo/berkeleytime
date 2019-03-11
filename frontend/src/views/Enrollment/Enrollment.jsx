import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

import {
  vars,
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
      
      allSectionIDs: [],

      newSectionIDs: [],

      sectionData: {}
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

  removeCourse(id) {
    this.setState(prevState => ({
      selectedCourses: prevState.selectedCourses.filter(classInfo => classInfo.id !== id)
    }));
  }

  getCurrentDate() {
    var today = new Date();
    return today.toString().slice(4, 15);
  }
  
  async fetchGrades() {
    if (this.state.newSectionIDs && this.state.newSectionIDs.length > 0) {
      try {
        
        const sectionIDKey = this.state.newSectionIDs.join('&');

        const grades = await axios.get('http://localhost:8000/grades/sections/' + sectionIDKey + '/');

        // add metadata like semester & instructor name
        // get from course search bar
        var metadata = grades.data;
        var gradeName;
        if (metadata) {
          for (var i in vars.possibleGrades) {
            gradeName = vars.possibleGrades[i]
            metadata[gradeName]["grade_name"] = gradeName;  
          }
          metadata["section_id"] = sectionIDKey;
        }

        console.log(metadata);

        /* metadatas.map((metadata) =>
          if (metadata["grade_id"] == grades["course_id"]) {
            for (var key in metadata) {
              grades[key] = metadata[key];
            }
            break;
          } 
        );*/

        // just need newest ones
        this.setState({
           sectionData: metadata
         });
        
      } catch (error) {
        console.error(error)
      }
    }
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
        <EnrollmentGraphCard
          id="chartHours"
          title="Enrollment"
          classData={this.state.sectionData}
        />

      </div>
    );
  }
}


export default Enrollment;
