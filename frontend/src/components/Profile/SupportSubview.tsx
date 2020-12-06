import React from 'react';
import Resource from './Resource';

const SupportSubview = () => {
  return (
    <div className="profile-subview">
      <h1>Support</h1>
      <h2>Resources</h2>

      <Resource text="Contact Us" link="mailto:octo.berkeleytime@asuc.org" />
      {/* <Resource text="Give us feedback" link="https://berkeleytime.com" /> */}
      <Resource text="Report a bug" link="/bugs" />
      {/* <Resource text="Delete Account" link="https://berkeleytime.com" /> */}
    </div>
  );
};

export default SupportSubview;
