import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';

<<<<<<< HEAD
import logo from '../../assets/img/images/landing/berkeleytime.gif';
=======
import { ReactComponent as Logo} from '../../assets/img/images/landing/landing_main.svg';
>>>>>>> ce04602085186564e6af2680d4a25053ff24fa90

function Jumbotron() {
  return (
    <div className="jumbo">
      <Container>
        <Row>
          <Col xs={6} sm={6} md={5} lg={5}>
            <div className="jumbo-heading">
              <h1>BerkeleyTime</h1>
              <p>Course discovery, simplified. <br /> Built by students for students.</p>
              <ButtonToolbar className="jumbo-heading-buttons">
                <Button variant="bt-primary" size="bt-lg" as={Link} to="/catalog">Explore courses</Button>
                <Button variant="bt-primary-inverted" size="bt-lg" as={Link} to="/about">About Us</Button>
              </ButtonToolbar>
            </div>
          </Col>
          <Col xs={6} sm={6} md={7} lg={7}>
            <div className="jumbo-img-container">
              <div className="jumbo-img">
                <Logo />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Jumbotron;
