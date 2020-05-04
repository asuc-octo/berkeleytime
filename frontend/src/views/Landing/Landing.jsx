import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Jumbotron from '../../components/Landing/Jumbotron';
import Explore from '../../components/Landing/Explore';
import Mission from '../../components/Landing/Mission';
import Blurbs from '../../components/Landing/Blurbs';
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
          <Blurbs />
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
