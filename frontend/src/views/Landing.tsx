import React, { FC } from 'react';

import Jumbotron from 'components/Landing/Jumbotron'
import Explore from 'components/Landing/Explore'
import Mission from 'components/Landing/Mission'
import Blurbs from 'components/Landing/Blurbs'

const Landing: FC = () => (
  <div>
    <Jumbotron />
    <Explore />
    <Mission />
    <Blurbs />
  </div>
)

export default Landing
