import React from 'react';
import { Col } from 'react-bootstrap';

function ClassCard(props) {
  const {
    id, course, title, fill, semester, faculty, removeCourse,
  } = props;

  return (
    <Col lg={3} xl={3} className="class-card-column">
      <div className="class-card">
        <div className="class-card-header">
          <div className="class-card-square" style={{ backgroundColor: fill }} />
          <div className="class-card-course">{ course }</div>
          <div className="class-card-remove" onClick={() => removeCourse(id)}>Remove</div>
        </div>
        <div className="class-card-title">{ title }</div>
        <div className="class-card-options">{ `${semester} • ${faculty}` }</div>
      </div>
    </Col>
  );
}

export default ClassCard;

/*
<div className="class-card content">
  <div className="class-card-upper">
    <div className="class-card course-abbreviation">
      {course}
    </div>
    <div className="class-card class-info">
      {`${semester} | ${faculty}`}
    </div>
  </div>
  <div className="class-card-lower">
    <div className="class-card class-title">
      {title}
    </div>
    <div className="delete" onClick={() => removeCourse(id)}>Remove</div>
  </div>
</div>
*/
