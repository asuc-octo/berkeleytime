import React, { FC, useState } from 'react';

import Jumbotron from 'components/Landing/Jumbotron'
import Explore from 'components/Landing/Explore'
import Mission from 'components/Landing/Mission'
import Blurbs from 'components/Landing/Blurbs'
import LandingModal from 'components/Landing/Modal'
import schedulerImg from '../assets/img/landing/scheduler.png';

const Landing: FC = () => {
  const [showModal, setShowModal] = useState(true);
  const modal_info = { subtitle: 'NEW!', title: 'Berkeleytime Scheduler', 
                       message: 'Try out our new scheduler feature to build your ideal schedule!', 
                       button: 'Explore Scheduler', link: '/scheduler', img: schedulerImg };
  return (
    <div>
      <LandingModal content={{...modal_info}} showModal={showModal} hideModal={() => setShowModal(false)} />
      <Jumbotron />
      <Explore />
      <Mission />
      <Blurbs />
    </div>
  );
}

export default Landing
