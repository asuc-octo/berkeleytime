import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';

import { ReactComponent as Logo} from '../../assets/img/images/landing/landing_main.svg';

function Jumbotron({ isMobile }) {
  return (
    <div className="jumbo">
      <Container>
        <Row>
          {isMobile ?
          <Col xs={12} sm={12} md={7} lg={7}>
            <div className="jumbo-img-container">
              <div className="jumbo-img">
                <Logo />
              </div>
            </div>
          </Col> : null
          }
          <Col xs={12} sm={12} md={5} lg={5}>
            <div className="jumbo-heading">
              <h1>Berkeley’s online course discovery platform.</h1>
              <p>Berkeleytime is a platform built, maintained, and run by students, just like you. We work hard to simplify and improve the course discovery experience.</p>
              <ButtonToolbar className="jumbo-heading-buttons">
                <Button variant="bt-primary" size="bt-lg" as={Link} to="/catalog">Explore courses</Button>
                <Button variant="bt-primary-inverted" size="bt-lg" as={Link} to="/about">About Us</Button>
              </ButtonToolbar>
            </div>
          </Col>
          {!isMobile ?
          <Col xs={12} sm={12} md={7} lg={7}>
            <div className="jumbo-img-container">
              <div className="jumbo-img">
                <Logo />
              </div>
            </div>
          </Col> : null
          }
        </Row>
      </Container>
    </div>
  );
}

export default Jumbotron;
