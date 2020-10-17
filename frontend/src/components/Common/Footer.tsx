import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'

const New: FC = () => <span className="footer-new ml-1">New</span>

const Footer: FC = () => (
  <footer className="pt-5">
    <Container>
      <Row>
        <Col xs={12} sm={4} lg={{ span: 2, offset: 3 }} className="footer-col mb-5">
          <h6 className="bt-bold mb-3">Get Started</h6>
          <Link to="/catalog" className="mb-2">Catalog</Link>
          <Link to="/grades" className="mb-2">Grades</Link>
          <Link to="/enrollment" className="mb-2">Enrollment</Link>
          <Link to="/apidocs">API Docs <New /></Link>
        </Col>
        <Col xs={12} sm={4} lg={2} className="footer-col mb-5">
          <h6 className="bt-bold mb-3">Support</h6>
          <Link to="/bugs" className="mb-2">Report a Bug</Link>
          <a href="mailto:octo.berkeleytime@asuc.org" className="mb-2">Contact Us</a>
          <a href="https://old.berkeleytime.com" className="mb-2">Legacy Site</a>
          <Link to="/releases" className="mb-2">Releases <New /></Link>
          <Link to="/faq">FAQ <New /></Link>
        </Col>
        <Col xs={12} sm={4} lg={2} className="footer-col mb-5">
          <h6 className="bt-bold mb-3">About Us</h6>
          <Link to="/about" className="mb-2">Our Team</Link>
          {/* <Link to="/apply" className="mb-2">Apply <New /></Link> */}
          <a href="https://octo.asuc.org" className="mb-2">ASUC OCTO</a>
          <a href="https://facebook.com/berkeleytime">Facebook</a>
        </Col>
      </Row>
    </Container>
  </footer>
)

export default Footer
