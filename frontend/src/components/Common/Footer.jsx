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
      <Container className="bt-footer-container">
        <Row>
          <Col
            xs={4}
            sm={4}
            md={4}
            lg={{ span: 2, offset: 3 }}
            className="bt-footer-column"
          >
            <p>Get Started</p>
            <Link to="/catalog" className=""><span className="footer-link">Catalog</span></Link>
            <Link to="/grades" className=""><span className="footer-link">Grades</span></Link>
            <Link to="/enrollment" className=""><span className="footer-link">Enrollment</span></Link>
            <Link to="/apidocs" className=""><span className="footer-link">API Docs</span><span className="new-box">New</span></Link>
          </Col>
          <Col xs={4} sm={4} md={4} lg={2} className="bt-footer-column">
            <p>Support</p>
            <Link to="/bugs"><span className="footer-link">Report a Bug</span></Link>
            <a href="mailto:octo.berkeleytime@asuc.org" className=""><span className="footer-link">Contact</span></a>
            <a href="http://old.berkeleytime.com/" className=""><span className="footer-link">Legacy</span></a>
            <Link to="/releases" className=""><span className="footer-link">Releases</span><span className="new-box">New</span></Link>
            <Link to="/faq" className=""><span className="footer-link">FAQ</span><span className="new-box">New</span></Link>
          </Col>
          <Col xs={4} sm={4} md={4} lg={2} className="bt-footer-column">
            <p className="">About</p>
            <Link to="/about" className=""><span className="footer-link">Team</span></Link>
            <Link to="/join" className=""><span className="footer-link">Join Us</span></Link>
            <a href="http://octo.asuc.org/" className=""><span className="footer-link">OCTO</span></a>
            <a href="https://www.facebook.com/berkeleytime/" className=""><span className="footer-link">Facebook</span></a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
