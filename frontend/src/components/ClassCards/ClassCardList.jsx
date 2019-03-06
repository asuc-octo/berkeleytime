import React, { Component } from 'react';

import ClassCard from './ClassCard';
import axios from 'axios';

class ClassCardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      classCards: [],
    }
  }

  componentDidMount() {
    this.getClassCards();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedCourses && prevProps.selectedCourses.length != this.props.selectedCourses.length) {
      this.getClassCards();
    }
  }

  getClassCards() {
    const { selectedCourses } = this.props;
    const promises = [];

    for(let course of selectedCourses) {
      promises.push(this.fetchData(course.courseID));
    }

    axios.all(promises).then(data => {
      let classCards = data.map((res, i) => {
        let courseData = res.data;
        let selectedData = selectedCourses[i];

        return {
          course: courseData.course,
          title: courseData.title,
          semester: selectedData.semester,
          instructor: selectedData.instructor,
          courseID: selectedData.courseID,
        }
      })

      this.setState({
        classCards: [...classCards],
      })
    })
  }

  fetchData(courseID) {
    return axios.get(`/api/catalog_json/course/${courseID}/`)
  }

  render() {
    const { classCards } = this.state;
    const { removeClass } = this.props;

    return (
      <div className="columns">
        {
          classCards.map(item => (
          <div className="column card-column">
            <ClassCard
              course={item.course}
              title={item.title}
              semester={item.semester == 'all' ? 'All Semester' : item.semester }
              faculty={item.instructor == 'all' ? 'All Instructors' : item.instructor}
              removeClass={removeClass}
            />
          </div>
        ))}
      </div>
    );
  }

}


export default ClassCardList;
