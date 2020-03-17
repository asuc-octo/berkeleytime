import React, { PureComponent } from 'react';

import Jumbotron from '../../components/Landing/Jumbotron';
import Explore from '../../components/Landing/Explore';
import Mission from '../../components/Landing/Mission';
import Sponsors from '../../components/Landing/Sponsors';
// import Modal from '../../components/Landing/Modal';

class Landing extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isMobile: false,                
    };
    this.updateScreensize = this.updateScreensize.bind(this);
  }

  /**
   * Checks if user is on mobile view
   */
  componentDidMount() {
    this.updateScreensize();
    window.addEventListener("resize", this.updateScreensize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateScreensize);
  }

  updateScreensize() {
    this.setState({ isMobile: window.innerWidth <= 768 });
  }

  render() {
    const { isMobile } = this.state;
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

export default Landing;
