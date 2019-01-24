import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function Footer() {
  return (
      <footer className="footer has-text-left">
        <div class="container">
          <div class="columns has-text-left">
            <div class="column is-2"> 
                <p className="first navbar-item"><b>Get Started</b></p>
                    <Link to="/" className="navbar-item">Sign Up</Link>
                    <Link to="/catalog" className="navbar-item">Catalog</Link>
                    <Link to="/enrollment" className="navbar-item">Enrollment</Link>
                </div>

                <div className="column is-2"> 
                    <p className="first navbar-item"><b>Support</b></p>
                    <Link to="/" className="navbar-item">Updates</Link>
                    <Link to="/" className="navbar-item">Contact</Link>
                </div>

                <div className="column is-2"> 
                    <p className="first navbar-item"><b>About Us</b></p>
                    <Link to="/about" className="navbar-item">About</Link>
                    <Link to="/join" className="navbar-item">Join Us</Link>
                    <a href="http://asucocto.org/" className="navbar-item">ASUC OCTO</a>
                </div>
          </div>
      {/* <p className="copyright text-center">
              &copy; {(new Date()).getFullYear()} ASUC OCTO Berkeleytime
      </p> */}
      </div>
  </footer>
  );
}
export default Footer;
