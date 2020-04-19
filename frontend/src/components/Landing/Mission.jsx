import React from 'react';
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
          <Col xs={12} md={7}>
            <img src={doe} alt="group pic" />
          </Col>
          <Col xs={12} md={5} xl={{ span: 4, offset: 1 }}>
            <div className="mission">
              <h3>Our Mission</h3>
              <p>Berkeleytime is an official organization under the
                <a href="http://octo.asuc.org/"> ASUC Office of the Chief Technology Officer.</a>{' '}
                We are dedicated to designing free, accessible software for students.
              </p>
              <Button variant="bt-primary-inverted" size="bt-md" as={Link} to="/about">About our Team</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Mission;
