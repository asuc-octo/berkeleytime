import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import hash from 'object-hash';

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
    this.updateScreensize = this.updateScreensize.bind(this);
    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.fillFromUrl = this.fillFromUrl.bind(this);
    this.addToUrl = this.addToUrl.bind(this);
    this.refillUrl = this.refillUrl.bind(this);
    this.toUrlForm = this.toUrlForm.bind(this);
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    fetchGradeContext();
    this.fillFromUrl();

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

  fillFromUrl() {
    const { fetchGradeClass, gradeReset, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && (url == '/grades/' || url == '/grades')) {
        gradeReset();
      } else if (url) {
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
          let u = `/api/grades/course_grades/${cUrl[1]}/`;
          axios.get(u)
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

  updateScreensize() {
    this.setState({ isMobile: window.innerWidth <= 768 });
  }

  render() {
    const { context, selectedCourses } = this.props;
    let { location } = this.props;
    const { isMobile } = this.state;
    let courses = context.courses;

    return (
      <div className="viewport-app">
        <div className="grades">
          { !isMobile ?
          <GradesSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
          /> : 
          <GradesSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
            isMobile={isMobile}
          /> }

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
        </div> 
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchGradeContext: () => dispatch(fetchGradeContext()),
  fetchGradeClass: (course) => dispatch(fetchGradeClass(course)),
  gradeRemoveCourse: (id, color) => dispatch(gradeRemoveCourse(id, color)),
  gradeReset: () => dispatch(gradeReset())
});

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
