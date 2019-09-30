import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bt-footer">
      <Container className="bt-footer-container">
        <Row>
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p><b>Get Started</b></p>
            <Link to="/catalog" className="">Catalog</Link>
            <Link to="/enrollment" className="">Enrollment</Link>
            <Link to="/grades" className="">Grades</Link>
          </Col>
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p><b>Support</b></p>
            <a href="http://old.berkeleytime.com/" className="">Legacy Site</a>
            <a href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">Report a Bug</a>
            <a href="mailto:octo.berkeleytime@asuc.org" className="">Contact</a>
          </Col>
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p className=""><b>About Us</b></p>
            <Link to="/about" className="">About</Link>
            <a href="http://asucocto.org/recruitment" className="">Join Us</a>
            <a href="http://asucocto.org/" className="">ASUC OCTO</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;