import React, { Component } from 'react';

function ClassDetails({
  details, prerequisites
}) {
  return (
    <div className="filter-description-tabs-details">
      <h2>Description</h2>
      <p>{details}</p>
      <h2>Prerequisites</h2>
      <p>{prerequisites}</p>
    </div>
  )
}

export default ClassDetails;
