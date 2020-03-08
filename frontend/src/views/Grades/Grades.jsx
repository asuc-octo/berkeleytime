import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import hash from 'object-hash';

import ClassCardList from '../../components/ClassCards/ClassCardList.jsx';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard.jsx';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar.jsx';

import { fetchGradeContext, fetchGradeClass, gradeRemoveCourse } from '../../redux/actions';
import { connect } from "react-redux";

class Grades extends Component {
  constructor(props) {
    super(props);

    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.fillFromUrl = this.fillFromUrl.bind(this);
    this.addToUrl = this.addToUrl.bind(this);
    this.refillUrl = this.refillUrl.bind(this);
    this.toUrlForm = this.toUrlForm.bind(this);
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    this.fillFromUrl();
    fetchGradeContext();
  }

  fillFromUrl() {
    const { fetchGradeClass, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && url != '/grades/' && url != '/grades') {
        let courseUrls = url.split('/')[2].split('&');
        for (const c of courseUrls) {
          let cUrl = c.split('-');
          let semester = cUrl[2];
          let instructor = cUrl.slice(3).join('-');
          if (cUrl[2] !== 'all') {
            semester = cUrl[2].charAt(0).toUpperCase() + cUrl[2].substring(1) + " " + cUrl[3];
            instructor = cUrl.slice(4).join('-');
          }
          let sections = [];
          let url = `http://localhost:8080/api/grades/course_grades/${cUrl[1]}/`;
          axios.get(url)
            .then(
              res => {
                try {
                  if (instructor == 'all') {
                    res.data.map((item, i) => sections[i] = item.grade_id);
                  } else {
                    let matches = res.data.filter(item => instructor == this.toUrlForm(item.instructor));
                    matches.map((item, i) => sections[i] = item.grade_id);
                    instructor = matches[0].instructor;
                  }
                  if (semester != 'all') {
                    let matches = res.data.filter(item => semester == item.semester[0].toUpperCase() + item.semester.substring(1) + ' ' + item.year);
                    let allSems = matches.map(item => item.grade_id);
                    sections = sections.filter(item => allSems.includes(item));
                  }
                  let formattedCourse = {
                    courseID: cUrl[1],
                    instructor: instructor,
                    semester: semester,
                    sections: sections
                  };
                  formattedCourse.id = hash(formattedCourse);
                  formattedCourse.colorId = cUrl[0];
                  fetchGradeClass(formattedCourse);
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
    let instructor = this.toUrlForm(course.instructor);
    let courseUrl = `${course.colorId}-${course.courseID}-${this.toUrlForm(course.semester)}-${instructor}`;
    let url = history.location.pathname;
    if (url && !url.includes(courseUrl)) {
      url += (url == '/grades') ? '/' : '';
      url += (url == '/grades/') ? '' : '&';
      url += courseUrl;
      history.push(url);
    }
  }

  addCourse(course) {
    const { fetchGradeClass, selectedCourses, usedColorIds } = this.props;
    for (let selected of selectedCourses) {
      let courseMatch = selected.courseID.toString() === course.courseID.toString();
      let instructorMatch = selected.instructor === course.instructor;
      let semesterMatch = selected.semester === course.semester;
      let sectionMatch = (selected.instructor === 'all') ? course.instructor === 'all' : selected.sections[0] === course.sections[0]
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
    fetchGradeClass(course);
  }

  refillUrl(id) {
    const { selectedCourses, history } = this.props;
    let updatedCourses = selectedCourses.filter(classInfo => classInfo.id !== id);
    let url = '/grades/';
    for (let i = 0; i < updatedCourses.length; i++) {
      let c = updatedCourses[i];
      if (i != 0) url += '&';
      let instructor = c.instructor == 'all' ? 'all' : c.sections[0];
      url += `${c.colorId}-${c.courseID}-${this.toUrlForm(c.semester)}-${instructor}`;
    }
    history.push(url);
  }

  removeCourse(id, color) {
    const { gradeRemoveCourse } = this.props;
    this.refillUrl(id);
    gradeRemoveCourse(id, color);
  }

  render() {
    const { context, selectedCourses } = this.props;
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
  const { context, selectedCourses, usedColorIds, sections } = state.grade;
  return {
    context,
    selectedCourses,
    usedColorIds,
    sections
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Grades));
