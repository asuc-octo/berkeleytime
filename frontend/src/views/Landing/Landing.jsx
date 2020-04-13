import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Jumbotron from '../../components/Landing/Jumbotron';
import Explore from '../../components/Landing/Explore';
import Mission from '../../components/Landing/Mission';
import Sponsors from '../../components/Landing/Sponsors';
// import Modal from '../../components/Landing/Modal';

class Landing extends PureComponent {

  render() {
    const { isMobile } = this.props;

    return (
      <div className="landing">
        <div className="landing-container">
          <Jumbotron 
            isMobile={isMobile}
          />
          <Explore />
          <Mission />
          <Sponsors />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { isMobile } = state.isMobile;
  return {
    isMobile,
  }
}

export default connect(mapStateToProps)(Landing);
