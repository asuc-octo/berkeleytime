import React, { FC } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { H6, A } from 'bt/custom';
import { Link } from 'react-router-dom';
import TextProps, { getClassNames } from '../Custom/TextProps';

const Footer: FC = () => (
  <footer className="py-5">
    <Container>
      <Row noGutters>
        <Col xs={4} lg={{ span: 2, offset: 3 }}>
          <div className="footer-col-container">
            <div className="footer-col">
              <h6 className='bt-h6 bt-bold mb-3'>Support</h6>
              <Link to='/bugs' className="mb-2">
                Report a Bug
              </Link>
              <a href="mailto:octo.berkeleytime@asuc.org" className="mb-2">
                Contact Us
              </a>
              <Link to='/faq' className="mb-2">
                FAQ
              </Link>
            </div>
          </div>
        </Col>
        <Col xs={4} lg={2}>
          <div className="footer-col-container">
            <div className="footer-col">
              <h6 className='bt-h6 bt-bold mb-3'>Updates</h6>
              <Link to='/releases' className="mb-2">
                Releases
              </Link>
              <a href="https://github.com/asuc-octo/berkeleytime" className="mb-2">
                GitHub
              </a>
              <a href="https://discord.gg/uP2bTPh99U" className="mb-2">
                Discord
              </a>
              <a href="https://facebook.com/berkeleytime" className="mb-2">
                Facebook
              </a>
            </div>
          </div>
        </Col>
        <Col xs={4} lg={2}>
          <div className="footer-col-container">
            <div className="footer-col">
              <h6 className='bt-h6 bt-bold mb-3'>About Us</h6>
              <Link to='/about' className="mb-2" >
                Our Team
              </Link>
              <a href="https://octo.asuc.org" className="mb-2">
                ASUC OCTO
              </a>
              <Link to='/legal/privacy' className="mb-2">
                Privacy Policy
              </Link>
              <Link to='//legal/terms' className="mb-2">
                Terms of Service
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
