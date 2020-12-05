import React, { PureComponent } from 'react';
import Resource from './Resource';

class SupportSubview extends PureComponent {
  render() {

    return (
      <div className="profile-subview">
        <h1>Support</h1>
        <h2>Resources</h2>

        {/* Information has been hardcoded for testing purposes only */}
        <Resource text="Contact Us" link="https://berkeleytime.com"/>
        <Resource text="Give us feedback" link="https://berkeleytime.com" />
        <Resource text="Report a bug" link="https://berkeleytime.com" />
        <Resource text="Delete Account" link="https://berkeleytime.com"/>
      </div>
    );
  }
}

export default SupportSubview;
