import React, { Component } from 'react';

function ClassDetails({
  description, prerequisites, requirements
}) {
  return (
    <div className="filter-description-tabs-details">
      {!description && !prerequisites &&
        <div>
          <h1>No Details</h1>
        </div>
      }

      {description &&
        <div className="filter-details-description">
          <h2>Description</h2>
          <p>{description}</p>
        </div>
      }

      {prerequisites &&
        <div className="filter-details-prerequisites">
          <h2>Prerequisites</h2>
          <p>{prerequisites}</p>
        </div>
      }

      {requirements &&
        <div className="filter-details-requirements">
          <h2>Tags</h2>
          <div className="filter-details-tags">
            {requirements.map(req => (
              <div className="filter-details-tag">{req}</div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}

export default ClassDetails;
