import React, { FC } from 'react';
import Description from '../../components/Recruiting/Description';

const PrivacyPolicy: FC = () => (
  <div className="viewport-app" style={{height: '100vh'}}>
    <Description
      title={'Privacy Policy'}
      bodyURL={'/assets/privacy.md'}
      link={'/legal/terms'}
      linkName={'Terms Of Service'}
    />
  </div>
);

export default PrivacyPolicy;
