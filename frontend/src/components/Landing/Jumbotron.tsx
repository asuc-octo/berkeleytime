import React, { FC } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  ButtonGroup,
} from 'react-bootstrap';

import { Button, H3, P } from 'bt/custom';
import logo from '../../assets/svg/landing/main.svg';

const Jumbotron: FC = () => (
  <div className="landing-jumbo">
    <Container>
      <Row>
        <Col xs={{ span: 12, order: 3 }} lg={{ span: 5, order: 1 }}>
          <div className="heading">
            <H3 bold className="mb-3">
              Berkeley’s online course discovery platform.
            </H3>
            <P className="mb-3">
              Berkeleytime is a platform built, maintained, and run by students,
              just like you. We work hard to simplify and improve the course
              discovery experience.
            </P>
            <ButtonToolbar>
              <ButtonGroup className="mr-2">
                <Button href={{ as_link: '/catalog' }}>Explore Courses</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button variant="inverted" href={{ as_link: '/about' }}>
                  About Us
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </div>
        </Col>
        <Col xs={{ span: 12, order: 2 }} lg={{ span: 7, order: 2 }}>
          <div className="animation-container">
            <img src={logo} alt="Welcome to BerkeleyTime." />
            <p className="credit">© Janet Xu</p>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Jumbotron;
