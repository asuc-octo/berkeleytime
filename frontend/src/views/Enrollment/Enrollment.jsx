import React, { Component } from 'react';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar';

import { fetchEnrollContext, fetchEnrollClass, enrollRemoveCourse, enrollReset } from '../../redux/actions';

class Enrollment extends Component {
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

  componentWillMount() {
    this.props.enrollReset();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreensize);
  }

  componentDidMount() {
    const { fetchEnrollContext, context } = this.props;
    fetchEnrollContext();

    //check is user is on mobile
    this.updateScreensize();
    window.addEventListener("resize", this.updateScreensize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedCourses != this.state.selectedCourses) {
      this.setState({
        selectedCourses: nextProps.selectedCourses,
      });
    }
  }

  addCourse(course) {
    const { fetchEnrollClass } = this.props;
    const { selectedCourses } = this.state;
    for (const selected of selectedCourses) {
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

  updateScreensize() {
    this.setState({ isMobile: window.innerWidth <= 576 });
  }

  render() {
    const { context } = this.props;
    const { selectedCourses, isMobile } = this.state;
    const { location } = this.props;
    const courses = context.courses;

    return (
      <div className="viewport-app">
        <div className="enrollment">
          { !isMobile ?
          <EnrollmentSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
            isMobile={isMobile}
          /> : null }

          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
          />

          <EnrollmentGraphCard
            id="gradesGraph"
            title="Enrollment"
            isMobile={isMobile}
          />

          { isMobile ?
          <EnrollmentSearchBar
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
  fetchEnrollContext: () => dispatch(fetchEnrollContext()),
  fetchEnrollClass: (course) => dispatch(fetchEnrollClass(course)),
  enrollRemoveCourse: (id) => dispatch(enrollRemoveCourse(id)),
  enrollReset: () => dispatch(enrollReset())
});

const mapStateToProps = state => {
  const { context, selectedCourses } = state.enrollment;
  return {
    context,
    selectedCourses,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Enrollment);
