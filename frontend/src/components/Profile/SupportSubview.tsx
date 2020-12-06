import React from 'react';
import Resource from './Resource';
import Subview from './Subview';

const SupportSubview = () => {
  return (
    <div className="support-view">
      <Subview title="Resources">
        <Resource text="Contact Us" link="mailto:octo.berkeleytime@asuc.org" />
        {/* <Resource text="Give us feedback" link="https://berkeleytime.com" /> */}
        <Resource text="Report a bug" link="/bugs" />
        {/* <Resource text="Delete Account" link="https://berkeleytime.com" /> */}
      </Subview>
    </div>
  );
};

export default SupportSubview;
