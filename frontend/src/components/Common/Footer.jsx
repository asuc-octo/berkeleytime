import React from 'react';
import { Link } from 'react-router-dom';

const New = () => <span className="new-box">New</span>;

function Footer() {
  return (
    <footer className="bt-footer">
      <div className="bt-footer-row">
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
          <a href="https://octo.asuc.org/"><span className="footer-link">OCTO</span></a>
          <a href="https://www.facebook.com/berkeleytime/"><span className="footer-link">Facebook</span></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
