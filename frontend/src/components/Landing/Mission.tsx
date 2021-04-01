import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { H3, P, Button } from 'bt/custom'

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
            <P className="mb-3">Our mission is to transform individuals into starters who follow their passion, develop lasting relationships, and create value through innovative pursuits.
            </P>
            <P className="mb-3">We love free labor. Contribute to our <a href="https://github.com/asuc-octo/berkeleytime">GitHub</a>. Looking for even more consulting? Come join our team, we'd love to have you!
            </P>
            <Button variant="inverted" href={{as_link: "/about"}}>About our Team</Button>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
)

export default Mission
