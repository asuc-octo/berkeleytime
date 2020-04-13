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
          <div className="class-card-remove" onClick={() => removeCourse(id, colorId)} >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.00001 19C6.00001 20.1 6.90001 21 8 21H16C17.1 21 18 20.1 18 19V7H6.00001V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="#FC7676"/>
            </svg>
          </div>
        </div>
        <div className="class-card-title">{ title }</div>
        <div className="class-card-options">{ `${semester} • ${faculty}` }</div>
      </div>
    </Col>
  );
}

export default ClassCard;
