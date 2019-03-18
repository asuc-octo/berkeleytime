import React, { Component } from 'react';

import ClassCard from './ClassCard';
import axios from 'axios';

import vars from '../../variables/Variables';

class ClassCardList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selectedCourses, removeCourse } = this.props;

    return (
      <div className="columns class-card-list">
        {
          selectedCourses.map((item, i) => (
          <div className="column card-column">
            <ClassCard
              id={item.id}
              course={item.course}
              title={item.title}
              fill={vars.colors[i % vars.colors.length]}
              semester={item.semester == 'all' ? 'All Semester' : item.semester }
              faculty={item.instructor == 'all' ? 'All Instructors' : item.instructor}
              removeCourse={removeCourse}
            />
          </div>
        ))}
      </div>
    );
  }

}


export default ClassCardList;
