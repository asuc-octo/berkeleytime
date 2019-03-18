import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

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
      console.log(err);
    });
  }

  addCourse(course) {
    console.log(course);
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

    console.log(selectedCourses);

    return (
      <div className="app-container">
        {courses ?
          (
            <ClassSearchBar
              isEnrollment
              classes={courses}
              addCourse={this.addCourse}
            />
          ) : (
            <div className="class-search-bar"></div>
          )
        }

        {selectedCourses.length > 0 ?
          (
            <ClassCardList
              selectedCourses={selectedCourses}
              removeCourse={this.removeCourse}
            />
          ) : (
            <div className="class-card-list"></div>
          )
        }

        <EnrollmentGraphCard
          id="gradesGraph"
          title="Enrollment"
          classData={selectedCourses}
        />

      </div>
    );
  }
}


export default Enrollment;
