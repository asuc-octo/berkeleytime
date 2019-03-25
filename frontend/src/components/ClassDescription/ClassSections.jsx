import React, { Component } from 'react';

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
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
            <th><abbr title="Lecture/Discussion/Lab">Type</abbr></th>
            <th class="ccn"><abbr title="Course Capture Number">CCN</abbr></th>
            <th class="type">Instructor</th>
            <th class="type">Time</th>
            <th>Location</th>
            <th>Enrolled</th>
            <th>Waitlist</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(section => {
            let startDate = new Date(section.start_time);
            let endDate = new Date(section.end_time);
            console.log(typeof(startDate));
            console.log(endDate);
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
