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
      selectedCourses: [],
    }

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
      console.log(err);
    });
  }

  addCourse(course) {
    axios.get(`/api/catalog_json/course/${course.courseID}/`)
      .then(res => {
        let courseData = res.data;

        let formattedCourse =  {
          id: course.id,
          course: courseData.course,
          title: courseData.title,
          semester: course.semester,
          instructor: course.instructor,
          courseID: course.courseID,
          sections: course.sections
        }

        this.setState(prevState => ({
          selectedCourses: [...prevState.selectedCourses, formattedCourse],
        }));
    })
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

        <GraphCard
          id="chartHours"
          title="Grades"
          classData={selectedCourses}
        />
      </div>
    );
  }
}

export default Grades;
