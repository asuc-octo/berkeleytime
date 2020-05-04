    import React from 'react';
import asuc_logo from '../../assets/img/images/landing/asuc_logo.png';
import stf_logo from '../../assets/img/images/landing/stf_logo.png';

function Blurbs() {
  return (
      <div>
    <div className="landing-blurbs">
      <div className="desc">
        <h3>Sponsors</h3>
        <p className="sponsor-desc">Thank you to the folks that help the Berkeleytime team continue to provide this service free-of-charge to students!</p>
      </div>
      <div className="sponsors">
        <a href="https://techfund.berkeley.edu/home">
          <img className="landing-sponsors-img" src={stf_logo} alt="stf" />
        </a>
        <a href="https://asuc.org">
          <img className="landing-sponsors-img" src={asuc_logo} alt="asuc" />
        </a>
      </div>
    </div>
    <div className="landing-blurbs">
      <div className="desc">
        <h3>In Memory Of Courtney Brousseau</h3>
        <p>Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC Chief Communications Officer, and Berkeley Mobile Product Manager</p>
      </div>
    </div>
      </div>
  );
}

export default Blurbs;