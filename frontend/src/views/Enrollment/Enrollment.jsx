import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar.jsx';

import { fetchEnrollContext, fetchEnrollClass, enrollRemoveCourse } from '../../redux/actions';
import { connect } from "react-redux";

class Enrollment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // context: {},
      selectedCourses: this.props.selectedCourses
    }

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this)
  }

  componentDidMount() {
    const { fetchEnrollContext, context } = this.props;
    fetchEnrollContext();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCourses != this.state.selectedCourses) {
      this.setState({
        selectedCourses: nextProps.selectedCourses
      })
    }
  }

  addCourse(course) {
    const { fetchEnrollClass } = this.props;
    const { selectedCourses } = this.state;
    for (let selected of selectedCourses) {
      if (selected.id === course.id) {
        return;
      }
    }
    fetchEnrollClass(course);
  }

  removeCourse(id) {
    const { enrollRemoveCourse } = this.props;
    enrollRemoveCourse(id);
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
          isFull={selectedCourses.length === 4}
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
    fetchEnrollClass: (course) => dispatch(fetchEnrollClass(course)),
    enrollRemoveCourse: (id) => dispatch(enrollRemoveCourse(id))
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
