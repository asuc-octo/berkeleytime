import React, { PureComponent } from 'react';

import Jumbotron from '../../components/Landing/Jumbotron';
import Explore from '../../components/Landing/Explore';
import Mission from '../../components/Landing/Mission';
import Sponsors from '../../components/Landing/Sponsors';
// import Modal from '../../components/Landing/Modal';

class Landing extends PureComponent {
  render() {
    return (
      <div className="landing">
        <div className="landing-container">
          <Jumbotron />
          <Explore />
          <Mission />
          <Sponsors />
        </div>
      </div>
    );
  }
}

export default Landing;
