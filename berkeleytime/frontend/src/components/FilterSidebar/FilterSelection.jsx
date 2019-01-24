import React from 'react';

function FilterSelection({
  courseAbbreviation, courseTitle, percentageEnrolled,
  units, waitlisted, averageGrade, borderColors,
  gradeColors, id,
}) {
  return (
    <div className={`filter-selection ${borderColors[id % 4]}`}>
      <div className="filter-selection-content">
        <h4 className="filter-selection-heading">{courseAbbreviation}</h4>
        <p className="filter-selection-description">{courseTitle}</p>
        <div className="filter-selection-enrollment-data">
          <div className="dataBlock">
            <i className="fa fa-circle first" />
            <p>{` ${percentageEnrolled}% enrolled`}</p>
          </div>
          <div className="dataBlock">
            <i className="fa fa-circle second" />
            <p>{` ${waitlisted} waitlisted`}</p>
          </div>
        </div>
      </div>
      <div className="filter-selection-aside">
        <div className="filter-selection-units">
          <h6>{`${units} Units`}</h6>
        </div>
        <div className="filter-selection-average-grade ">
          <h5>Average Grade</h5>
          <p className={gradeColors[averageGrade.charAt(0)] || 'bt-red-text'}>{averageGrade}</p>
        </div>
      </div>
      <div className="vertical-line" />
    </div>
  );
}

FilterSelection.defaultProps = {
  courseAbbreviation: 'CS 61A',
  courseTitle: 'The Structure and Interpretation of Computer Programs',
  percentageEnrolled: 100,
  units: 4,
  waitlisted: 5,
  averageGrade: 'B',
  borderColors: ['bt-blue-border', 'bt-green-border', 'bt-pink-border', 'bt-yellow-border'],
  gradeColors: {
    A: 'bt-green-text',
    B: 'bt-orange-text',
  },
  id: 0,
};

export default FilterSelection;
