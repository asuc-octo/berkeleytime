import React from 'react';

function CurrentSchedule({ current }) {
  return (
    <div className="card dashboard-card">
      <div className="dashboard-container">
        <h4 className="dashboard-card-title"><b>Current Schedule</b></h4>
        <div className="dashboard-schedule-list">
          <h5>{current.semester}</h5>
          {current.classes.map(currentClass => (
            <p>
              {currentClass.name}
              {' '}
              <span>
                {currentClass.units}
                {' '}
                Units
              </span>
            </p>
          ))}
        </div>
        <a className="dashboard-schedule-link">View Schedule Calendar →</a>
      </div>
    </div>
  );
}

CurrentSchedule.defaultProps = {
  current: {
    semester: 'Spring 2018',
    classes: [
      {
        name: 'Theater R1B',
        units: 4,
      },
      {
        name: 'Cog Sci 1',
        units: 4,
      },
      {
        name: 'ESPM 50AC',
        units: 4,
      },
      {
        name: 'Comp Sci 98/198',
        units: 2,
      },
    ],
  },
};

export default CurrentSchedule;
