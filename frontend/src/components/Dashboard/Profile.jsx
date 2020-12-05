import React from 'react';

import jemma from 'assets/img/about/2020-21/michael_1.jpg';

function Profile({ profile }) {
  return (
    <div className="card dashboard-card">
      <div className="dashboard-container">
        <div className="dashboard-profile-pic-container">
          <img className="dashboard-profile-pic" src={profile.pic} />
          <h3 className="dashboard-profile-name"><b>{profile.name}</b></h3>
        </div>
        <div className="dashboard-profile-info">
          <div className="dashboard-profile-info-section">
            <h4>Major(s)</h4>
            {profile.majors.map(major => (
              <p>{major}</p>
            ))}
          </div>
          <div className="dashboard-profile-info-section">
            <h4>Academic Career</h4>
            <p>{profile.academic_career}</p>
          </div>
          <div className="dashboard-profile-info-section">
            <h4>Level</h4>
            <p>{profile.academic_career}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

Profile.defaultProps = {
  profile: {
    name: 'Jemma Kwak',
    pic: jemma,
    majors: [
      'Cognitive Science (L&S)',
      'a double major',
    ],
    academic_career: 'Undergraduate',
    level: 'Junior',
  },
};

export default Profile;
