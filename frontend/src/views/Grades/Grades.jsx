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
      isMobile: false,
    };
    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.updateScreensize = this.updateScreensize.bind(this);
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    fetchGradeContext();

    //check is user is on mobile
    this.updateScreensize();
    window.addEventListener("resize", this.updateScreensize);
  }

  componentWillMount() {
    this.props.gradeReset();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreensize);
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

  updateScreensize() {
    this.setState({ isMobile: window.innerWidth <= 768 });
  }

  render() {
    const { context, location } = this.props;
    const { selectedCourses, isMobile } = this.state;
    const courses = context.courses;
    return (
      <div className="viewport-app">
        <div className="grades">
          { !isMobile ?
          <GradesSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
          /> : null }

          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
            isMobile={isMobile}
          />

          <GradesGraphCard
            id="gradesGraph"
            title="Grades"
            isMobile={isMobile}
          />

          { isMobile ?
          <GradesSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
            isMobile={isMobile}
          /> : null }
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
