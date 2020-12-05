import React from 'react';

function PastSchedule({ past }) {
  return (
    <div className="card dashboard-card">
      <div className="dashboard-container">
        <h4 className="dashboard-card-title"><b>Past Semesters</b></h4>
        {past.map(semester => (
          <div className="dashboard-schedule-list">
            <h5>{semester.semester}</h5>
            {semester.classes.map(pastClass => (
              <p>
                {pastClass.name}
                {' '}
                <span>
                  {pastClass.units}
                  {' '}
                  Units
                </span>
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

PastSchedule.defaultProps = {
  past: [
    {
      semester: 'Fall 2017',
      classes: [
        {
          name: 'Comp Sci 61B',
          units: 4,
        },
        {
          name: 'Des Inv 10',
          units: 4,
        },
        {
          name: 'Comp Sci C8',
          units: 4,
        },
        {
          name: 'Comp Sci 98/198',
          units: 2,
        },
        {
          name: 'Comp Sci 199',
          units: 2,
        },
      ],
    },
    {
      semester: 'Spring 2017',
      classes: [
        {
          name: 'Comp Sci 61A',
          units: 4,
        },
      ],
    },
  ],
};

export default PastSchedule;
