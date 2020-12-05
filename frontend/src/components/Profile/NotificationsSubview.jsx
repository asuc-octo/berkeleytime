import React, { PureComponent } from 'react';
import Preference from './Preference';

class NotificationsSubview extends PureComponent {
  render() {

    return (
      <div className="profile-subview">
        <h1>Notifications</h1>
        <h2>Email Preferences</h2>
        <Preference text="Class updates in catalog"/>
        <Preference text="Updated grades for saved classes"/>
        <Preference text="Enrollment openings in catalog"/>
        <Preference text="Updates to Stanfurdtime's software"/>
      </div>
    );
  }
}

export default NotificationsSubview;
