import React, { Component } from 'react';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';

import { fetchGradeContext, fetchGradeClass, gradeRemoveCourse, gradeReset } from '../../redux/actions';

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

  componentWillMount() {
    this.props.gradeReset();
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    fetchGradeContext();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCourses != this.state.selectedCourses) {
      this.setState({
        selectedCourses: nextProps.selectedCourses,
      });
    }
  }

  addCourse(course) {
    const { fetchGradeClass } = this.props;
    const { selectedCourses } = this.state;
    for (const selected of selectedCourses) {
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
    const { context, location } = this.props;
    const { selectedCourses } = this.state;
    const courses = context.courses;
    return (
      <div className="viewport-app">
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
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchGradeContext: () => dispatch(fetchGradeContext()),
  fetchGradeClass: (course) => dispatch(fetchGradeClass(course)),
  gradeRemoveCourse: (id) => dispatch(gradeRemoveCourse(id)),
  gradeReset: () => dispatch(gradeReset())
});

const mapStateToProps = state => {
  const { context, selectedCourses } = state.grade;
  return {
    context,
    selectedCourses,
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Grades);
