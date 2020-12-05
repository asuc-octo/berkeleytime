import React from 'react';

import Profile from '../../components/Dashboard/Profile.jsx';
import CurrentSchedule from '../../components/Dashboard/CurrentSchedule.jsx';
import PastSchedule from '../../components/Dashboard/PastSchedule.jsx';

function Dashboard() {
  return (
    <div className="app-container">
      <div className="dashboard-columns columns is-multiline is-mobile">
        <div className="column is-narrow">
          <Profile />
        </div>
        <div className="column is-narrow">
          <CurrentSchedule />
        </div>
        <div className="column is-narrow">
          <PastSchedule />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
