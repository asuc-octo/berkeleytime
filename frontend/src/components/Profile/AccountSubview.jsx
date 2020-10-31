import React, { PureComponent } from 'react';

class Property extends PureComponent {
  render() {

    return (
      <div className="profile-subview">
        <h3>Your Account</h3>
        <h4>Personal Information</h4>
          <Property attribute="Full Name" value="Oski Bear"/>
          <Property attribute="bConnected Email" value="oski@berkeley.edu"/>
          <Property attribute="Major(s)" value="Psychology"/>
      </div>
    );
  }
}

export default Property;