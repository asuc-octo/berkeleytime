import React from 'react';
import { Col } from 'react-bootstrap';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';

function ClassCard(props) {
  const {
    id, course, title, fill, semester, faculty, removeCourse, isMobile
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
