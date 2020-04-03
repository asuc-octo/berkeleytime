import React from 'react';
import { Col } from 'react-bootstrap';
import {
  percentileToString,
  getGradeColor
} from '../../utils/utils';

function ClassCardMobile(props) {
  const {
    id, course, title, fill, semester, faculty, courseLetter, courseGPA, sectionLetter, sectionGPA, removeCourse, colorId, hoveredClass
  } = props;

  console.log(course);

  return (
    <Col xs={12} sm={12} lg={3} xl={3} className="class-card-column">
      <div className="class-card">
        <div className="class-card-header">
          <div className="class-card-square" style={{ backgroundColor: fill }} />
          <div className="class-card-course">{ course }</div>
          <div className="class-card-remove" onClick={() => removeCourse(id, colorId)}>Remove</div>
        </div>
        <div className="class-card-title">{ title }</div>
        <div className="class-card-options">{ `${semester} • ${faculty}` }</div>
        <h6>Course Average</h6>
        <div className="course-average">
          <span>{ courseLetter }</span>
          ({ courseGPA })
        </div>
        <h6>Section Average</h6>
        <div className="section-average">
          <span>{ sectionLetter }</span>
          ({ sectionGPA })
        </div>
      </div>
    </Col>
  );
}

export default ClassCardMobile;