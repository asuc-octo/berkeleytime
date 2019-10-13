import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';

function Mission() {
  return (
    <div className="landing-mission">
      <Container>
        <Row>
          <Col lg={6}>
            <div className="landing-mission-column">
              <h3>Our Mission</h3>
              <p className="has-text-centered">Berkeleytime is an official organization under the ASUC Office of the Chief Technology Officer. We are dedicated to designing free, accessible software for students.</p>
              <a href="http://asucocto.org/">ASUC OCTO <FontAwesome name="long-arrow-right" /></a>
            </div>
          </Col>
          <Col lg={6}>
            <div className="landing-mission-column">
              <h3>Who We Are</h3>
              <p className="has-text-centered">We are a group of dedicated developers and designers helping simplify your course selection and planning experience as seamless as possible. Designed for students, by students.</p>
              <Link to="/about">About Us <FontAwesome name="long-arrow-right" /></Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Mission;
