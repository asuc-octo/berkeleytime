import React, { PureComponent } from 'react';

class Property extends PureComponent {
  render() {
    const { attribute, value } = this.props;

    return (
      <div className="profile-row">
        <p className="personal-attribute">{attribute}</p>
        <p>{value}</p>
      </div>
    );
  }
}

export default Property;