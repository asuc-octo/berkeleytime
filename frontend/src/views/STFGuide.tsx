import React, { FC } from 'react';
import Description from '../components/Recruiting/Description';

const STFGuide: FC = () => (
  <Description
    title={'A note from the Berkeleytime Team'}
    bodyURL={'/assets/stf_guide.md'}
    link={'/landing'}
    linkName={'Back to landing'}
  />
);

export default STFGuide;
