import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';

import { fetchGradeContext, fetchGradeClass } from '../../redux/actions';

class Grades extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // context: {},
      selectedCourses: this.props.selectedCourses,
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
      <div className="grades viewport-app">
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
    fetchGradeClass: (course) => dispatch(fetchGradeClass(course))
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
