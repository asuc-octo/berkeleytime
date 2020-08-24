import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';

import { ReactComponent as Logo } from '../../assets/svg/landing/main.svg';

function Jumbotron() {
  return (
    <div className="landing-jumbo">
      <Container>
        <Row>
          <Col xs={{ span: 12, order: 3 }} md={{ span: 5, order: 1 }}>
            <div className="heading">
              <h1>Berkeley’s online course discovery platform.</h1>
              <p>Berkeleytime is a platform built, maintained, and run by students, just like you. We work hard to simplify and improve the course discovery experience.</p>
              <ButtonToolbar className="heading-buttons">
                <Button variant="bt-primary" size="bt-md" as={Link} to="/catalog">Explore Courses</Button>
                <Button variant="bt-primary-inverted" size="bt-md" as={Link} to="/apply">Join Our Team</Button>
              </ButtonToolbar>
            </div>
          </Col>
          <Col xs={{ span: 12, order: 2 }} md={7}>
            <div className="animation-container">
              <Logo />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Jumbotron;
