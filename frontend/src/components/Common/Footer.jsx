import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bt-footer">
      <Container className="bt-footer-container">
        <Row>
          <Col lg={2}></Col>  {/* Helps center the entire footer */}
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p><b>Get Started</b></p>
            <Link to="/catalog" className="">Courses</Link>
            <Link to="/grades" className="">Grades</Link>
            <Link to="/enrollment" className="">Enrollment</Link>
            <Row><Col lg={6}><Link to="/releases" className="">Releases</Link></Col>
                 <Col lg={2}><div className="new-box"><p>New</p></div></Col>
            </Row>
          </Col>
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p><b>Support</b></p>
            <a href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">Report a Bug</a>
            <a href="mailto:octo.berkeleytime@asuc.org" className="">Contact</a>
            <a href="http://old.berkeleytime.com/" className="">Legacy</a>
            <a href="" className="">Privacy Policy</a>
          </Col>
          <Col xs={4} sm={4} md={3} lg={2} className="bt-footer-column">
            <p className=""><b>About</b></p>
            <Link to="/about" className="">Team</Link>
            <a href="http://asucocto.org/" className="">Office of the CTO</a>
            <a href="http://asucocto.org/recruitment" className="">Join Us</a>
            <a href="https://www.facebook.com/berkeleytime/" className="">Facebook</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;