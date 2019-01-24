import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

function NavigationLinks() {
  return (
    <div className="navbar-end">
        <Link to="/catalog" className="navbar-item">Catalog</Link>
        <Link to="/scheduler" className="navbar-item">Scheduler</Link>
        <Link to="/grades" className="navbar-item">Grades</Link>
        <Link to="/enrollment" className="navbar-item">Enrollment</Link>
        <Link to="/about" className="navbar-item">About</Link>
        <Link to="/login" className="navbar-item">Login</Link>
      </div>
  );
}

export default NavigationLinks;
