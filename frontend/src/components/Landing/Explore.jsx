import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import {
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import course from '../../assets/img/images/landing/courses.svg';
import grade from '../../assets/img/images/landing/grades.svg';
import history from '../../assets/img/images/landing/history.svg';

function Explore() {
  return (

  <div className="landing-explore">
    <h5>Our Features</h5>
    <Row>
        <Col xs={12} s={12} md={4} lg={4} className="feature">
          <img src={course} />
          <h6>Course Catalog</h6>
          <p>Search through 12,000+ courses at Berkeley. Apply filters for requirements.</p>
        </Col>
        <Col xs={12} s={12} md={4} lg={4} className="feature">
          <img src={grade} />
          <h6>Grade Distributions</h6>
          <p>View and compare grade distributions for each course and semester.</p>
        </Col>
        <Col xs={12} s={12} md={4} lg={4} className="feature">
          <img src={history} />
          <h6>Enrollment History</h6>
          <p>Track accurate, real-time course enrollment trends and history.</p>
        </Col>
    </Row>
  </div>
  );
}

export default Explore;
