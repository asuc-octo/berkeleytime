import React from 'react';
import { Col } from 'react-bootstrap';

function ClassCard(props) {
  const {
    id, course, title, fill, semester, faculty, removeCourse, colorId
  } = props;

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
      </div>
    </Col>
  );
}

export default ClassCard;