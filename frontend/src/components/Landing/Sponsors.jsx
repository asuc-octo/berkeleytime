import React from 'react';
import asuc_logo from '../../assets/img/images/landing/asuc_logo.png';
import stf_logo from '../../assets/img/images/landing/stf_logo.png';

function Sponsors() {
  return (
    <div className="landing-sponsors">
          <div className="landing-sponsors-desc">
            <h3 className="has-text-centered">Sponsors</h3>
            <p className="has-text-centered">Thank you to the folks that help the BerkeleyTime team continue to provide this service free-of-charge to students!</p>
          </div>
          <div className="landing-sponsors-img-wrapper">
            <a href="https://techfund.berkeley.edu/home">
            <img className="landing-sponsors-img" src={stf_logo} alt="stf" /></a>
            <a href="https://asuc.org"><img className="landing-sponsors-img" src={asuc_logo} alt="asuc" /></a>
          </div>
    </div>
  );
}

export default Sponsors;