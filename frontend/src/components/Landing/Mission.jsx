import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import doe from '../../assets/img/images/about/group/doe.jpg';

function Mission() {
  return (
    <div className="landing-mission">
      <Container>
        <Row>
          <Col xs={6} s={6} md={6} lg={6}>
            <img src={doe} className="landing-mission-img" />
          </Col>
          <Col xs={6} s={6} md={6} lg={6}>
            <div className="landing-mission-desc">
              <h3>Our Mission</h3>
              <p className="has-text-centered landing-mission-link">Berkeleytime is an official organization under the 
              <a href="http://octo.asuc.org/"> ASUC Office of the Chief Technology Officer. </a>
              We are dedicated to designing free, accessible software for students.</p>
              <Button variant="bt-primary-inverted btn-bt-md" size="bt-lg" as={Link} to="/about">About our Team</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Mission;
