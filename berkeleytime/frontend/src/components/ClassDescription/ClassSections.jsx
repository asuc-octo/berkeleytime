import React, { Component } from 'react';

function ClassSections({ sections }) {
  return (
    <div className="filter-description-tabs-sections">
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Lecture/Discussion/Lab">Type</abbr></th>
            <th><abbr title="What exactly does this stand for?">CCN</abbr></th>
            <th>Time</th>
            <th>Location</th>
            <th>Enrolled</th>
            <th>Waitlist</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(section => (
            <tr>
              <th>{section.type}</th>
              <th>{section.ccn}</th>
              <th>{section.time}</th>
              <th>{section.location}</th>
              <th>{section.enrolled}/{section.capacity}</th>
              <th>{section.waitlist}/{section.waitlistCapacity}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ClassSections;
