import React, { FC } from 'react'
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  ButtonGroup
} from 'react-bootstrap'

import { Button, H3, P } from 'bt/custom'
import { ReactComponent as Logo } from '../../assets/svg/landing/main.svg'
import Stanfurd from '../../assets/img/landing/stanfurd.png';

const Jumbotron: FC = () => (
  <div className="landing-jumbo">
    <Container>
      <Row>
        <Col xs={{ span: 12, order: 3 }} lg={{ span: 5, order: 1 }} style={{ zIndex: 0 }}>
          <div className="heading">
            <H3 bold className="mb-3">Stanfurd’s online course discovery platform.</H3>
            <P className="mb-3">Stanfurdtime is a platform built, maintained, and run by Stanfurd's premier tech consulting club. We work hard to simplify and improve the course discovery experience.</P>
            <ButtonToolbar>
              <ButtonGroup className="mr-2">
                <Button href="https://real.berkeleytime.com">I don't like this</Button>
              </ButtonGroup>
            </ButtonToolbar>
          </div>
        </Col>
        <Col xs={{ span: 12, order: 2 }} lg={{ span: 7, order: 2 }} style={{ zIndex: 0 }}>
          <div className="animation-container">
            <Logo />
            <p className="credit">© Not Janet Xu 🙂</p>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
)

export default Jumbotron
