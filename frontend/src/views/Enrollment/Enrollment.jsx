import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
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
        {courses &&
          <ClassSearchBar
            isEnrollment
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

        {true &&
          <EnrollmentGraphCard
            id="chartHours"
            title="Enrollment"
            classData={selectedCourses}
          />
        }

      </div>
    );
  }
}


export default Enrollment;
