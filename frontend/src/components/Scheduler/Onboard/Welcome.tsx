import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

type Props = {
  updatePage: (i: number) => void;
};

const Welcome = ({ updatePage }: Props) => {
  return (
      <Container className="welcome">
        <Row>
          <Col>
            <h1>Welcome to Berkeleytime&apos;s Scheduler</h1>
            <h3>Use our scheduler to build your ideal schedule. Search our catalog to add new classes or select from saved ones, and add your own time preferences.</h3>
            <Button
              className="bt-btn-primary"
              onClick={() => updatePage(1)}
            >
              Start
            </Button>
            {/* <p>Click to view <a>saved schedules</a></p> */}
          </Col>
        </Row>
      </Container>
  );
};

export default Welcome;
