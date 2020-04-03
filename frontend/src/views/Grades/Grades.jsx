import React, { Component } from 'react';
import { withRouter } from 'react-router';
import hash from 'object-hash';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';

import { fetchGradeContext, fetchGradeClass, gradeRemoveCourse, gradeReset, fetchGradeFromUrl } from '../../redux/actions';

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

  componentWillMount() {
    this.props.gradeReset();
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    fetchGradeContext();
    this.fillFromUrl();
  }

  fillFromUrl() {
    const { gradeReset, fetchGradeFromUrl, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && (url == '/grades/' || url == '/grades')) {
        gradeReset();
      } else if (url) {
        fetchGradeFromUrl(url, history);
      }
    } catch (err) {
      history.push('/error');
    }
  }

  toUrlForm(s) {
    s = s.replace('/', '_');
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
    fetchGradeClass(course);
  }

  refillUrl(id) {
    const { selectedCourses, history } = this.props;
    let updatedCourses = selectedCourses.filter(classInfo => classInfo.id !== id);
    let url = '/grades/';
    for (let i = 0; i < updatedCourses.length; i++) {
      let c = updatedCourses[i];
      if (i != 0) url += '&';
      url += `${c.colorId}-${c.courseID}-${this.toUrlForm(c.semester)}-${this.toUrlForm(c.instructor)}`;
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
  gradeRemoveCourse: (id, color) => dispatch(gradeRemoveCourse(id, color)),
  gradeReset: () => dispatch(gradeReset()),
  fetchGradeFromUrl: (url, history) => dispatch(fetchGradeFromUrl(url, history))
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
