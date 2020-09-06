import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'

const New: FC = () => <span className="footer-new ml-1">New</span>

const Footer: FC = () => (
  <footer className="py-5">
    <Container>
      <Row>
        <Col xs={12} sm={4} lg={{ span: 2, offset: 3 }} className="footer-col mb-4">
          <h6 className="bt-bold mb-3">Get Started</h6>
          <Link to="/catalog" className="mb-2">Catalog</Link>
          <Link to="/grades" className="mb-2">Grades</Link>
          <Link to="/enrollment" className="mb-2">Enrollment</Link>
          <Link to="/apidocs">API Docs <New /></Link>
        </Col>
        <Col xs={12} sm={4} lg={2} className="footer-col mb-4">
          <h6 className="bt-bold mb-3">Support</h6>
          <Link to="/bugs" className="mb-2">Report a Bug</Link>
          <a href="mailto:octo.berkeleytime@asuc.org" className="mb-2">Contact Us</a>
          <a href="https://old.berkeleytime.com" className="mb-2">Legacy Site</a>
          <Link to="/releases" className="mb-2">Releases <New /></Link>
          <Link to="/faq">FAQ <New /></Link>
        </Col>
        <Col xs={12} sm={4} lg={2} className="footer-col mb-4">
          <h6 className="bt-bold mb-3">About Us</h6>
          <Link to="/about" className="mb-2">Our Team</Link>
          {/* <Link to="/apply" className="mb-2">Apply <New /></Link> */}
          <a href="https://octo.asuc.org" className="mb-2">ASUC OCTO</a>
          <a href="https://facebook.com/berkeleytime">Facebook</a>
        </Col>
      </Row>
    </Container>
    {/* <div className="bt-footer-row">
      <div className="bt-footer-column">
        <h6>Get Started</h6>
        <Link to="/catalog"><span className="footer-link">Catalog</span></Link>
        <Link to="/grades"><span className="footer-link">Grades</span></Link>
        <Link to="/enrollment"><span className="footer-link">Enrollment</span></Link>
        <Link to="/apidocs"><span className="footer-link">API Docs</span><New /></Link>
      </div>
      <div className="bt-footer-column">
        <h6>Support</h6>
        <Link to="/bugs"><span className="footer-link">Report a Bug</span></Link>
        <a href="mailto:octo.berkeleytime@asuc.org"><span className="footer-link">Contact</span></a>
        <a href="https://old.berkeleytime.com/"><span className="footer-link">Legacy</span></a>
        <Link to="/releases"><span className="footer-link">Releases</span><New /></Link>
        <Link to="/faq"><span className="footer-link">FAQ</span><New /></Link>
      </div>
      <div className="bt-footer-column">
        <h6>About</h6>
        <Link to="/about"><span className="footer-link">Team</span></Link>
        <Link to="/apply"><span className="footer-link">Apply</span><New /></Link>
        <a href="https://octo.asuc.org/"><span className="footer-link">OCTO</span></a>
        <a href="https://www.facebook.com/berkeleytime/"><span className="footer-link">Facebook</span></a>
      </div>
    </div> */}
  </footer>
)

export default Footer
