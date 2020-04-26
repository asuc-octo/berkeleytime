import React from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import course from '../../assets/svg/landing/courses.svg';
import grade from '../../assets/svg/landing/grades.svg';
import history from '../../assets/svg/landing/history.svg';

function Explore() {
  return (
    <div className="landing-explore">
      <h5>Our Features</h5>
      <Row>
        <Col xs={12} md={4} className="feature">
          <img src={course} alt="courses" />
          <h6>Course Catalog</h6>
          <p>Search through 12,000+ courses at Berkeley. Apply filters for requirements.</p>
        </Col>
        <Col xs={12} md={4} className="feature">
          <img src={grade} alt="grades" />
          <h6>Grade Distributions</h6>
          <p>View and compare grade distributions for each course and semester.</p>
        </Col>
        <Col xs={12} md={4} className="feature">
          <img src={history} alt="history" />
          <h6>Enrollment History</h6>
          <p>Track accurate, real-time course enrollment trends and history.</p>
        </Col>
      </Row>
    </div>
  );
}

export default Explore;
