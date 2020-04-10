import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bt-footer">
      <Container className="bt-footer-container">
        <Row>
          <Col
            xs={4}
            sm={4}
            md={4}
            lg={{ span: 2, offset: 3 }}
            className="bt-footer-column"
          >
            <p><b>Get Started</b></p>
            <Link to="/catalog" className="">Courses</Link>
            <Link to="/grades" className="">Grades</Link>
            <Link to="/enrollment" className="">Enrollment</Link>
            <Link to="/releases" className="">Releases<span className="new-box">New</span></Link>
          </Col>
          <Col xs={4} sm={4} md={4} lg={2} className="bt-footer-column">
            <p><b>Support</b></p>
            <a href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">Report a Bug</a>
            <a href="mailto:octo.berkeleytime@asuc.org" className="">Contact</a>
            <a href="http://old.berkeleytime.com/" className="">Legacy</a>
            <Link to="/apidocs" className="">API Docs<span className="new-box">New</span></Link>
            <Link to="/faq" className="">FAQ<span className="new-box">New</span></Link>
          </Col>
          <Col xs={4} sm={4} md={4} lg={2} className="bt-footer-column">
            <p className=""><b>About</b></p>
            <Link to="/about" className="">Team</Link>
            <a href="http://octo.asuc.org/" className="">OCTO</a>
            <a href="http://asucocto.org/recruitment" className="">Join Us</a>
            <a href="https://www.facebook.com/berkeleytime/" className="">Facebook</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
