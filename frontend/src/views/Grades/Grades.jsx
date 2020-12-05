import React, { Component } from 'react';
import { withRouter } from 'react-router';
import hash from 'object-hash';

import { connect } from 'react-redux';
import ClassCardList from '../../components/ClassCards/ClassCardList';
import GradesGraphCard from '../../components/GraphCard/GradesGraphCard';
import GradesSearchBar from '../../components/ClassSearchBar/GradesSearchBar';

import info from '../../assets/img/images/graphs/info.svg';

import { fetchGradeContext, fetchGradeClass, gradeRemoveCourse, gradeReset, fetchGradeFromUrl } from '../../redux/actions';

class Grades extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // context: {},
      selectedCourses: this.props.selectedCourses,
      additionalInfo: [],
    };
    this.addCourse = this.addCourse.bind(this);
    this.removeCourse = this.removeCourse.bind(this);
    this.fillFromUrl = this.fillFromUrl.bind(this);
    this.addToUrl = this.addToUrl.bind(this);
    this.refillUrl = this.refillUrl.bind(this);
    this.toUrlForm = this.toUrlForm.bind(this);
    this.updateClassCardGrade = this.updateClassCardGrade.bind(this);
  }

  componentDidMount() {
    const { fetchGradeContext } = this.props;
    fetchGradeContext();
    this.fillFromUrl();
  }

  componentWillMount() {
    this.props.gradeReset();
  }

  fillFromUrl() {
    const { gradeReset, fetchGradeFromUrl, history } = this.props;
    try {
      let url = history.location.pathname;
      if (url && (url === '/grades/' || url === '/grades')) {
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
      url += (url === '/grades') ? '/' : '';
      url += (url === '/grades/') ? '' : '&';
      url += courseUrl;
      history.replace(url);
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
      if (i !== 0) url += '&';
      url += `${c.colorId}-${c.courseID}-${this.toUrlForm(c.semester)}-${this.toUrlForm(c.instructor)}`;
    }
    history.replace(url);
  }

  removeCourse(id, color) {
    const { gradeRemoveCourse } = this.props;
    this.refillUrl(id);
    gradeRemoveCourse(id, color);
  }

  updateClassCardGrade(course_letter, course_gpa, section_letter, section_gpa) {

    var info=[]
    for(var i=0; i<course_letter.length; i++) {
      info.push([course_letter[i], course_gpa[i], section_letter[i], section_gpa[i]])
    }
    this.setState({ additionalInfo: info })
  }

  render() {
    const { context, selectedCourses, isMobile } = this.props;
    let { location } = this.props;
    const { additionalInfo } = this.state;
    let courses = context.courses;

    return (
      <div className="viewport-app">
        <div className="grades">
          <GradesSearchBar
            classes={courses}
            addCourse={this.addCourse}
            fromCatalog={location.state ? location.state.course : false}
            isFull={selectedCourses.length === 4}
            isMobile={isMobile}
          />

          <ClassCardList
            selectedCourses={selectedCourses}
            removeCourse={this.removeCourse}
            additionalInfo={additionalInfo}
            type="grades"
            isMobile={isMobile}
          />

          <GradesGraphCard
            id="gradesGraph"
            title="Grades"
            updateClassCardGrade={this.updateClassCardGrade}
            isMobile={isMobile}
          />


          <div className="disclaimer">
            <img src={info} className="info" />
            <p>We source our course grade data from Stanfurd's official <a href="https://cardinalanswers.stanfurd.edu/">CardinalAnswers</a> database.</p>
          </div>

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
  const { mobile } = state.common;
  return {
    context,
    selectedCourses,
    usedColorIds,
    sections,
    isMobile: mobile,
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Grades));
