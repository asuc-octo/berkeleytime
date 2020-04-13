import React, { Component } from 'react';
import { withRouter } from 'react-router';
import hash from 'object-hash';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar';

import { fetchEnrollContext, fetchEnrollClass, enrollRemoveCourse, enrollReset, updateEnrollData, fetchEnrollFromUrl } from '../../redux/actions';

class Enrollment extends Component {
  constructor(props) {
    super(props)

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.fillFromUrl = this.fillFromUrl.bind(this);
    this.addToUrl = this.addToUrl.bind(this);
    this.refillUrl = this.refillUrl.bind(this);
    this.toUrlForm = this.toUrlForm.bind(this);
    this.updateClassCardEnrollment = this.updateClassCardEnrollment.bind(this);
  }

  componentDidMount() {
    const { fetchEnrollContext } = this.props;
    fetchEnrollContext();
    this.fillFromUrl();
  }

  fillFromUrl() {
    const { enrollReset, fetchEnrollFromUrl, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && (url == '/enrollment/' || url == '/enrollment')) {
        enrollReset();
      } else if (url) {
        fetchEnrollFromUrl(url, history);
      }
    } catch (err) {
      history.push('/error');
    }
  }

  toUrlForm(s) {
    return s.toLowerCase().split(" ").join('-');
  }

  addToUrl(course) {
    const { history } = this.props;
    let instructor = course.instructor == 'all' ? 'all' : course.sections[0];
    let courseUrl = `${course.colorId}-${course.courseID}-${this.toUrlForm(course.semester)}-${instructor}`;
    let url = history.location.pathname;
    if (url && !url.includes(courseUrl)) {
      url += (url == '/enrollment') ? '/' : '';
      url += (url == '/enrollment/') ? '' : '&';
      url += courseUrl;
      history.push(url);
    }
  }

  addCourse(course) {
    const { fetchEnrollClass, selectedCourses, usedColorIds } = this.props;
    for (let selected of selectedCourses) {
      if (selected.id === course.id) {
        return;
      }
    }

    let newColorId = "";
    for (let i = 0; i < 4; i++) {
      if (!usedColorIds.includes(i.toString())) {
        newColorId = i.toString();
        break;
      }
    }
    course.colorId = newColorId;

    this.addToUrl(course);
    fetchEnrollClass(course);
  }

  refillUrl(id) {
    const { selectedCourses, history } = this.props;
    let updatedCourses = selectedCourses.filter(classInfo => classInfo.id !== id);
    let url = '/enrollment/';
    for (let i = 0; i < updatedCourses.length; i++) {
      let c = updatedCourses[i];
      if (i != 0) url += '&';
      let instructor = c.instructor == 'all' ? 'all' : c.sections[0];
      url += `${c.colorId}-${c.courseID}-${this.toUrlForm(c.semester)}-${instructor}`;
    }
    history.push(url);
  }

  removeCourse(id, color) {
    const { enrollRemoveCourse } = this.props;
    this.refillUrl(id);
    enrollRemoveCourse(id, color);
  }

  updateClassCardEnrollment(course_letter, course_gpa, section_letter, section_gpa) {
  }


  render() {
    const { context, selectedCourses, isMobile } = this.props;
    let { location } = this.props;
    let courses = context.courses;

    return (
      <div className="viewport-app">
        <div className="enrollment">
          <EnrollmentSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
            isMobile={isMobile}
          /> 

          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
          />

          <EnrollmentGraphCard
            id="gradesGraph"
            title="Enrollment"
            updateClassCardEnrollment={this.updateClassCardEnrollment}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchEnrollContext: () => dispatch(fetchEnrollContext()),
  fetchEnrollClass: (course) => dispatch(fetchEnrollClass(course)),
  enrollRemoveCourse: (id, color) => dispatch(enrollRemoveCourse(id, color)),
  enrollReset: () => dispatch(enrollReset()),
  updateEnrollData: (enrollmentData) => dispatch(updateEnrollData(enrollmentData)),
  fetchEnrollFromUrl: (url, history) => dispatch(fetchEnrollFromUrl(url, history))
});

const mapStateToProps = state => {
  const { context, selectedCourses, usedColorIds } = state.enrollment;
  const { isMobile } = state.isMobile;

  return {
    context,
    selectedCourses,
    usedColorIds,
    isMobile,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Enrollment));
