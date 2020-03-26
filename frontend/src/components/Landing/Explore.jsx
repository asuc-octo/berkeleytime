import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import course from '../../assets/img/images/landing/course-vector.png';
import grade from '../../assets/img/images/landing/grade-vector.png';
import enrollment from '../../assets/img/images/landing/enrollment-vector.png';

function Explore() {
  return (
    <div className="landing-explore">
      <Container>
        <Row>
          <Col xs={12} s={12} md={4} lg={4}>
            <div className="landing-explore-content">
              <img src={course} className="landing-explore-img" />
              <h3>Course Catalog</h3>
              <p className="has-text-centered">Search through 12,000+ courses at Berkeley. Apply filters for requirements and courses.</p>
              <Link to="/catalog" className="">Browse Courses</Link>
            </div>
          </Col>
          <Col xs={12} s={12} md={4} lg={4}>
            <div className="landing-explore-content">
              <img src={grade} className="landing-explore-img" />
              <h3>Grade Distributions</h3>
              <p className="has-text-centered">View and compare grade distributions for each course and semester to make the best choice.</p>
              <Link to="/grades" className="">View Grades</Link>
            </div>
          </Col>
          <Col xs={12} s={12} md={4} lg={4}>
            <div className="landing-explore-content">
              <img src={enrollment} className="landing-explore-img" />
              <h3>Enrollment History</h3>
              <p className="has-text-centered">See and compare accurate, real-time course enrollment trends <br></br> and history.</p>
              <Link to="/enrollment" className="">Track Enrollment</Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Explore;
