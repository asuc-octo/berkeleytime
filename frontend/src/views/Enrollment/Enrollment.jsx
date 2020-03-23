import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import hash from 'object-hash';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard';
import EnrollmentSearchBar from '../../components/ClassSearchBar/EnrollmentSearchBar';

import { fetchEnrollContext, fetchEnrollClass, enrollRemoveCourse, enrollReset, updateEnrollData } from '../../redux/actions';

class Enrollment extends Component {
  constructor(props) {
    super(props)

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.fillFromUrl = this.fillFromUrl.bind(this);
    this.addToUrl = this.addToUrl.bind(this);
    this.refillUrl = this.refillUrl.bind(this);
    this.toUrlForm = this.toUrlForm.bind(this);
  }

  componentDidMount() {
    const { fetchEnrollContext } = this.props;
    fetchEnrollContext();
    this.fillFromUrl();
  }

  fillFromUrl() {
    const { fetchEnrollClass, enrollReset, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && (url == '/enrollment/' || url == '/enrollment')) {
        enrollReset();
      } else if (url) {
        let courseUrls = url.split('/')[2].split('&');
        for (const c of courseUrls) {
          let cUrl = c.split('-');
          let semester = cUrl[2].charAt(0).toUpperCase() + cUrl[2].substring(1) + " " + cUrl[3];
          let u = `/api/enrollment/sections/${cUrl[1]}/`;
          axios.get(u)
            .then(
              res => {
                try {
                  let sections = [cUrl[4]];
                  let instructor = 'all';
                  let match = [];
                  if (cUrl[4] == 'all') {
                    match = res.data.filter(item => cUrl[2] == item.semester.toLowerCase() && cUrl[3] == item.year)[0];
                    sections = match.sections.map(item => item.section_id);
                  } else {
                    match = res.data.map(item => item.sections.filter(item => item.section_id.toString() == cUrl[4]));
                    instructor = match.filter(item => item.length != 0)[0][0].instructor;
                  }
                  let formattedCourse = {
                    courseID: cUrl[1],
                    instructor: instructor,
                    semester: semester,
                    sections: sections
                  };
                  formattedCourse.id = hash(formattedCourse);
                  formattedCourse.colorId = cUrl[0];
                  fetchEnrollClass(formattedCourse);
                } catch (err) {
                  history.push('/error');
                }
              },
              error => console.log('An error occurred.', error),
            );
        }
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
      let courseMatch = selected.courseID.toString() === course.courseID.toString();
      let instructorMatch = selected.instructor === course.instructor;
      let semesterMatch = selected.semester === course.semester;
      let sectionMatch = (selected.instructor === 'all') ? course.instructor === 'all' : selected.sections[0].toString() === course.sections[0].toString();
      if (courseMatch && instructorMatch && semesterMatch && sectionMatch) {
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

  render() {
    const { context, selectedCourses } = this.props;
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
          />

          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
          />

          <EnrollmentGraphCard
            id="gradesGraph"
            title="Enrollment"
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
  updateEnrollData: (enrollmentData) => dispatch(updateEnrollData(enrollmentData))
});

const mapStateToProps = state => {
  const { context, selectedCourses, usedColorIds } = state.enrollment;
  return {
    context,
    selectedCourses,
    usedColorIds
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Enrollment));
