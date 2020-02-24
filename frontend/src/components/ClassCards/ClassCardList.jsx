import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap';

import ClassCard from './ClassCard';

import vars from '../../variables/Variables';

class ClassCardList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selectedCourses, removeCourse } = this.props;

    return (
      <Row className="class-card-list justify-content-start">
        {
          selectedCourses.map((item, i) => (
          <Col lg={3} className="card-column">
            <ClassCard
              id={item.id}
              course={item.course}
              title={item.title}
              fill={vars.colors[i]}
              semester={item.semester == 'all' ? 'All Semester' : item.semester }
              faculty={item.instructor == 'all' ? 'All Instructors' : item.instructor}
              removeCourse={removeCourse}
              colorId={item.colorId}
            />
          </Col>
        ))}
      </Row>
    );
  }

}


export default ClassCardList;
