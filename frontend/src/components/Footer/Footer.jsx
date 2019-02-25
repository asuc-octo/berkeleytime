import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bt-footer">
      <div className="columns is-mobile">
        <div className="column is-1-fullhd is-2-tablet is-4-mobile">
          <p className="btfooter-column"><b>Get Started</b></p>
          <Link to="/dashboard" className="">Sign Up</Link>
          <Link to="/catalog" className="">Catalog</Link>
          <Link to="/enrollment" className="">Enrollment</Link>
        </div>

        <div className="column is-1-fullhd is-2-tablet is-4-mobile">
          <p className=""><b>Support</b></p>
          <Link to="/" className="">Updates</Link>
          <Link to="/">Report a Bug</Link>
          <Link to="/" className="">Contact</Link>
        </div>

        <div className="column is-1-fullhd is-2-tablet is-4-mobile">
          <p className=""><b>About Us</b></p>
          <Link to="/about" className="">About</Link>
          <Link to="/join" className="">Join Us</Link>
          <a href="http://asucocto.org/" className="">ASUC OCTO</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
