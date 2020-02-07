import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList.jsx';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard.jsx';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar.jsx';

import { fetchGradeContext, fetchGradeClass, gradeRemoveCourse } from '../../redux/actions';
import { connect } from "react-redux";

class Grades extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // context: {},
      selectedCourses: this.props.selectedCourses
    };
    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
  }

  componentDidMount() {
    const { fetchGradeContext, context } = this.props;
    fetchGradeContext();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCourses != this.state.selectedCourses) {
      console.log(nextProps.selectedCourses);
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
    fetchGradeClass(course);
  }

  removeCourse(id) {
    const { gradeRemoveCourse } = this.props;
    gradeRemoveCourse(id);
  }

  render() {
    const { context } = this.props;
    const { selectedCourses } = this.state;
    let { location } = this.props
    let courses = context.courses;

    return (
      <div className="grades">
        <GradesSearchBar
          classes={courses}
          addCourse={this.addCourse}
          fromCatalog={location.state ? location.state.course : false}
          isFull={selectedCourses.length === 4}
        />

        <ClassCardList
          selectedCourses={selectedCourses}
          removeCourse={this.removeCourse}
        />

        <GradesGraphCard
          id="gradesGraph"
          title="Grades"
          classData={selectedCourses}
        />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    fetchGradeContext: () => dispatch(fetchGradeContext()),
    fetchGradeClass: (course) => dispatch(fetchGradeClass(course)),
    gradeRemoveCourse: (id) => dispatch(gradeRemoveCourse(id))
  }
}

const mapStateToProps = state => {
  const { context, selectedCourses } = state.grade;
  return {
    context,
    selectedCourses
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Grades);
