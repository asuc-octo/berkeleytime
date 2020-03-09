import React from 'react';
import { Container, Row, Col, ButtonToolbar, ButtonGroup, Button, } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import empty_graph from '../../assets/img/images/empty-graph.png';

function Error() {
  return (
    <div className="error viewport-app">
      <Container>
        <Row>
          <Col md={{span: 5, order: 2}} lg={4}
            className="img-container">
            <img src={empty_graph} alt="empty_graph" />
          </Col>
          <Col md={{span: 5, offset: 1, order: 1}} lg={6} className="content">
            <h1>404</h1>
            <h3>Uh oh.</h3>
            <p>
              Looks like the page you were looking for couldn't be found.
              <br />
              Here's a couple of things you can do.
            </p>
            <ButtonToolbar>
              <ButtonGroup className="mr-3 mb-2">
                <Button variant="bt-primary" size="bt-lg" as={Link} to="/catalog">Back to Catalog</Button>
              </ButtonGroup>
              <ButtonGroup className="mb-2">
                <Button variant="bt-primary-inverted" size="bt-lg" href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">Report a Bug</Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Row>
      </Container>
    </div>
  );

  return (
    <div className="level error">
      <div className="level-left">
        <div className="error-heading">
          <h1>404</h1>
          <h2>Uh oh.</h2>
          <p>Looks like the page you were looking for couldn&apos;t be found.</p>
          <p>Here are a couple things you can do.</p>
          <div className="error-buttons">
            <button type="button" className="button error-info"><Link to="/catalog"><b>Back to Classes</b></Link></button>
            <button type="button" className="button error-bugs"><a href="https://docs.google.com/forms/d/e/1FAIpQLSdP9GySJRnQmmYFxdoxmcw1Ar_uw-cPXqRdXpJg-Lg2SPksaw/viewform"><b>Report a Bug</b></a></button>
          </div>
        </div>
        <div className="level-right">
          <img className="error-img" src={empty_graph} alt="empty_graph" />
        </div>
      </div>
    </div>
  );
}

export default Error;
