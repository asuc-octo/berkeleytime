import React, { FC } from 'react';

import Jumbotron from 'components/Landing/Jumbotron'
import Explore from 'components/Landing/Explore'
import Mission from 'components/Landing/Mission'
import Blurbs from 'components/Landing/Blurbs'
import LandingModal from 'components/Landing/LandingModal'

const Landing: FC = () => {
  return (
    <div>
      <LandingModal/>
      <Jumbotron />
      <Explore />
      <Mission />
      <Blurbs />
    </div>
  );
}

export default Landing
