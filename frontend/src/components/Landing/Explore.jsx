import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';

function Explore({ title, desc, action, link, symbol, img, reverse }) {
  if (!reverse) {
    return (
      <div className="landing-explore landing-explore-reverse">
        <Container>
          <Row>
            <Col lg={3}>
              <div className="landing-explore-desc">
                <FontAwesome className={`landing-explore-icon app-icon`} name={symbol} size="5x" />
                <h3>{title}</h3>
                <p>{desc}</p>
                <Link to={link}>{action} <FontAwesome name="long-arrow-right" /></Link>
              </div>
            </Col>
            <Col lg={9}>
              <div className="landing-explore-img-wrapper">
                <img className="landing-explore-img box-shadow" src={img} alt="explore" />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
  return (
    <div className="landing-explore">
      <Container>
        <Row>
          <Col lg={9}>
            <div className="landing-explore-img-wrapper">
              <img className="landing-explore-img box-shadow" src={img} alt="explore" />
            </div>
          </Col>
          <Col lg={3}>
            <div className="landing-explore-desc">
              <FontAwesome className={`landing-explore-icon app-icon`} name={symbol} size="5x" />
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link to={link}>{action} <FontAwesome name="long-arrow-right" /></Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Explore;
