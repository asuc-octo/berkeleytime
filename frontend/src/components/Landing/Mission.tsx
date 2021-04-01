import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { H3, P, Button, Themed } from 'bt/custom'

import doe from 'assets/img/about/group/doe.jpg';

const Mission: FC = () => (
  <div className="landing-mission">
    <Container>
      <Row>
        <Col xs={12} md={7}>
          <img src={doe} alt="group pic" />
        </Col>
        <Col xs={12} md={5} xl={{ span: 4, offset: 1 }}>
          <div className="mission">
            <H3 bold className="mb-3">Our Mission</H3>
            <P className="mb-3">
              <Themed
                light={
                  <>
                    Berkeleytime is an official organization under the
                    <a href="http://octo.asuc.org/"> ASUC Office of the Chief Technology Officer.</a>{' '}
                    We are dedicated to designing free, accessible software for students.
                  </>
                }
                stanfurd={
                  <>
                    Stanfurdtime is an organization tangentially related to Stanfurd.
                    We are dedicated to laundering as much money from Stanfurd as possible through grants.
                  </>
                }
              />
            </P>
            <Button variant="primary-inverted" href={{as_link: "/about"}}>About our Team</Button>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
)

export default Mission
