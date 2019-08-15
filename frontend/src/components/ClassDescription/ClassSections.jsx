import React, { Component } from 'react';

function formatDate(date) {
  var hours = date.getUTCHours();
  var minutes = date.getUTCMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function ClassSections({ sections }) {
  return (
    <div className="filter-description-tabs-sections">
      <table className="table">
        <thead>
          <tr>
            <th style={{width: '75px'}}><abbr title="Lecture/Discussion/Lab">Type</abbr></th>
            <th style={{width: '50px'}}><abbr title="Course Capture Number">CCN</abbr></th>
            <th style={{width: '100px'}}>Instructor</th>
            <th style={{width: '85px'}}>Time</th>
            <th style={{width: '85px'}}>Location </th>
            <th style={{width: '75px'}}>Enrolled </th>
            <th style={{width: '75px'}}>Waitlist </th>
          </tr>
        </thead>
        <tbody>
          {sections.map(section => {
            let startDate = new Date(section.start_time + "Z");
            let endDate = new Date(section.end_time + "Z");
            return (
              <tr>
                <td>{section.kind}</td>
                <td>{section.ccn}</td>
                <td>{section.instructor}</td>
                {!isNaN(startDate) && !isNaN(endDate) ? (
                 <td>{section.word_days} {formatDate(startDate)} - {formatDate(endDate)}</td>
                ) : (
                  <td></td>
                )}
                <td>{section.location_name}</td>
                <td>{section.enrolled}/{section.enrolled_max}</td>
                <td>{section.waitlisted}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ClassSections;
