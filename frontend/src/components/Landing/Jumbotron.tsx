import React, { FC } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  ButtonGroup,
} from 'react-bootstrap';

import { Button, H3, P, Themed } from 'bt/custom';
import { ReactComponent as Logo } from '../../assets/svg/landing/main.svg';
import stanfurd from 'assets/img/landing/stanfurd.png';

const Jumbotron: FC = () => (
  <div className="landing-jumbo">
    <Container>
      <Row>
        <Col xs={{ span: 12, order: 3 }} lg={{ span: 5, order: 1 }}>
          <div className="heading">
            <H3 bold className="mb-3">
              <Themed light={<>Berkeley</>} stanfurd={<>Stanfurd</>} />&apos;s online course discovery platform.
            </H3>
            <P className="mb-3">
              <Themed
                light={
                  <>
                    Berkeleytime is a platform built, maintained, and run by students,
                    just like you. We work hard to simplify and improve the course
                    discovery experience.
                  </>
                }
                stanfurd={
                  <>
                    Stanfurdtime is a platform built, maintained, and run by Stanfurd&apos;s
                    premier tech consulting club. We work hard to pretend like we&apos;re doing a
                    lot of work.
                  </>
                }
              />
            </P>
            <ButtonToolbar>
              <ButtonGroup className="mr-2">
                <Button href={{ as_link: '/catalog' }}>Explore Courses</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button variant="primary-inverted" href={{ as_link: '/about' }}>
                  About Us
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </div>
        </Col>
        <Col xs={{ span: 12, order: 2 }} lg={{ span: 7, order: 2 }}>
          <div className="animation-container">
            <Themed
              light={
                <Logo title="Welcome to Berkeleytime." />
              }
              stanfurd={
                <img src={stanfurd} alt="Welcome to Stanfurd" />
              }
            />
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);

export default Jumbotron;
