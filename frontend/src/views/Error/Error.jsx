import React from 'react';
import { Container, Row, Col, ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import empty_graph from '../../assets/img/images/empty-graph.png';
import { Button } from 'bt/custom'

function Error() {
  return (
    <div className="error viewport-app-404">
      <Container>
        <Row>
          <Col md={{ span: 5, order: 2 }} lg={4} className="img-container">
            <img src={empty_graph} alt="empty_graph" />
          </Col>
          <Col md={{ span: 5, offset: 1, order: 1 }} lg={6} className="content">
            <h1>404</h1>
            <h3>
              Uh oh. Looks like the page you&apos;re looking for doesn&apos;t
              exist.
            </h3>
            <p>Here are a couple of things you can do.</p>
            <ButtonToolbar>
              <ButtonGroup className="mr-3 mb-2">
                <Button className="bt-btn-primary" size="bt-lg" href={{ as_link: "/catalog" }}>
                  Back to Courses
                </Button>
              </ButtonGroup>
              <ButtonGroup className="mb-2">
                <Button className="bt-btn-inverted" size="bt-lg" href={{ as_link: "/bugs" }}>
                  Report a Bug
                </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Error;
