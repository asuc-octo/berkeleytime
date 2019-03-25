import React from 'react';
import { Link } from 'react-router-dom';

function NavigationLinks() {
  return (
    <div className="navbar-end">
      <div className="navbar-item">
        <Link to="/catalog">Catalog</Link>
      </div>
      <div className="navbar-item">
        <Link to="/scheduler">Scheduler</Link>
      </div>
      <div className="navbar-item">
        <Link to="/grades">Grades</Link>
      </div>
      <div className="navbar-item">
        <Link to="/enrollment">Enrollment</Link>
      </div>
      <div className="navbar-item">
        <Link to="/about">About</Link>
      </div>
    </div>
  );
}

export default NavigationLinks;
