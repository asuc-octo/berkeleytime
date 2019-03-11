import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList.jsx';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

import vars from '../../variables/Variables';

class Grades extends Component {
  constructor(props) {
    super(props)

    this.state = {
      context: {},
      selectedCourses: [], //basic metadata from search bar

      // all section id displayed on screen so far
      allSectionIDs: Grades.defaultProps.sectionIDs,

      //newest section id [] selected by user; fetch data & update sectiondata
      newSectionIDs: Grades.defaultProps.sectionIDs,

      //only the newest grades fetched by user
      sectionData: {} //Grades.defaultProps.sectionData
    }

    this.fetchGrades();

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this)
  }

  componentDidMount() {
    axios.get('/api/grades_json/')
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
      newSectionIDs: course[sections]
    }));

    this.fetchGrades();
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

  removeCourse(id) {
    this.setState(prevState => ({
      selectedCourses: prevState.selectedCourses.filter(classInfo => classInfo.id !== id)
    }));
  }

  render() {
    const { context, selectedCourses } = this.state;
    let courses = context.courses;

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

      {false &&
        <GraphCard
          id="chartHours"
          title="Grades"
          classData={this.state.sectionData}
        />
      }

      </div>
    );
  }
}

export default Grades;
