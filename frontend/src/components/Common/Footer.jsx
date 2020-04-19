import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function New() {
  return (
    <span className="new-box">New</span>
  );
}

function Footer() {
  return (
    <footer className="bt-footer">
      <Container>
        <Row noGutters>
          <Col xs={4} lg={{ span: 2, offset: 3 }} className="footer-col">
            <p><b>Get Started</b></p>
            <Link to="/catalog"><span>Courses</span></Link>
            <Link to="/grades"><span>Grades</span></Link>
            <Link to="/enrollment"><span>Enrollment</span></Link>
            <Link to="/releases"><span>Releases</span><New /></Link>
          </Col>
          <Col xs={4} lg={2} className="footer-col">
            <p><b>Support</b></p>
            <a href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1"><span>Report a Bug</span></a>
            <a href="mailto:octo.berkeleytime@asuc.org"><span>Contact</span></a>
            <a href="http://old.berkeleytime.com/"><span>Legacy</span></a>
            <Link to="/apidocs"><span>API Docs</span><New /></Link>
            <Link to="/faq"><span>FAQ</span><New /></Link>
          </Col>
          <Col xs={4} lg={2} className="footer-col">
            <p><b>About</b></p>
            <Link to="/about"><span>Team</span></Link>
            <a href="http://octo.asuc.org/"><span>Office of the CTO</span></a>
            <a href="/join"><span>Join Us</span></a>
            <a href="https://www.facebook.com/berkeleytime/"><span>Facebook</span></a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
