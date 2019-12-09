import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar.jsx';

import { fetchEnrollContext, fetchEnrollClass } from '../../redux/actions';
import { connect } from "react-redux";

class Enrollment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // context: {},
      selectedCourses: [],
    }

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this)
  }

  componentDidMount() {
    const { fetchEnrollContext, context } = this.props;
    fetchEnrollContext();
    // axios.get('http://localhost:8080/api/enrollment_json/')
    // .then(res => {
    //   // console.log(res);
    //   this.setState({
    //     context: res.data,
    //   })
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCourses != this.state.selectedCourses) {
      this.setState({
        selectedCourses: nextProps.selectedCourses
      })
    }
  }

  addCourse(course) {
    const { fetchGradeClass } = this.props;
    const { selectedCourses } = this.state;
    for (let selected of selectedCourses) {
      if (selected.id === course.id) {
        return;
      }
    }
    // axios.get(`http://localhost:8080/api/catalog_json/course/${course.courseID}/`)
    //   .then(res => {
    //     let courseData = res.data;
    //
    //     let formattedCourse =  {
    //       id: course.id,
    //       course: courseData.course,
    //       title: courseData.title,
    //       semester: course.semester,
    //       instructor: course.instructor,
    //       courseID: course.courseID,
    //       sections: course.sections
    //     }
    //
    //     this.setState(prevState => ({
    //       selectedCourses: [...prevState.selectedCourses, formattedCourse],
    //     }));
    // })
    fetchEnrollClass(course);
  }

  removeCourse(id) {
    this.setState(prevState => ({
      selectedCourses: prevState.selectedCourses.filter(classInfo => classInfo.id !== id)
    }));
  }

  render() {
    const { context } = this.props;
    const { selectedCourses } = this.state;
    let { location } = this.props
    let courses = context.courses;

    return (
      <div className="enrollment">
        <EnrollmentSearchBar
          classes={courses}
          addCourse={this.addCourse}
          fromCatalog={location.state ? location.state.course : false}
          isFull={selectedCourses.length === 6}
        />

        <ClassCardList
          selectedCourses={selectedCourses}
          removeCourse={this.removeCourse}
        />

        <EnrollmentGraphCard
          id="gradesGraph"
          title="Enrollment"
          classData={selectedCourses}
        />

      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    fetchEnrollContext: () => dispatch(fetchEnrollContext()),
    fetchEnrollClass: (course) => dispatch(fetchEnrollClass(course))
  }
}

const mapStateToProps = state => {
  const { context, selectedCourses } = state.enrollment;
  return {
    context,
    selectedCourses
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Enrollment);
