import React, { PureComponent } from 'react';
import Property from './Property';
import ProfileCard from './ProfileCard';

class AccountSubview extends PureComponent {
  render() {

    return (
      <div className="profile-subview">
        <h1>Your Account</h1>
        <h2>Personal Information</h2>

        {/* Information has been hardcoded for testing purposes only */}
        <Property attribute="Full Name" value="Oski Bear"/>
        <Property attribute="bConnected Email" value="oski@berkeley.edu"/>
        <Property attribute="Major(s)" value="Psychology"/>
        
        <h2>Saved Classes</h2>

        {/* Information has been hardcoded for testing purposes only */}
        <ProfileCard abbreviation="ASAMST" course_number="143AC" title="Asian American Health" letter_average="A" enrolled_percentage=".5" units="3"/>
        
        <p className="see-all-classes">See all classes</p>
      </div>
    );
  }
}

export default AccountSubview;