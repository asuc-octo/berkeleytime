import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bt-footer">
      <div className="columns is-mobile">
        <div className="column is-1-fullhd is-2-tablet is-4-mobile">
          <p className="btfooter-column"><b>Get Started</b></p>
          <Link to="/catalog" className="">Catalog</Link>
          <Link to="/enrollment" className="">Enrollment</Link>
          <Link to="/grades" className="">Grades</Link>
        </div>

        <div className="column is-1-fullhd is-2-tablet is-4-mobile">
          <p className=""><b>Support</b></p>
          <a href="http://old.berkeleytime-internal.com/" className="">Legacy Site</a>
          <a href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">Report a Bug</a>
          <a href="mailto:octo.berkeleytime@asuc.org" className="">Contact</a>
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
