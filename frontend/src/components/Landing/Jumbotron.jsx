import React from 'react';
import { Link } from 'react-router-dom';

import logo from '../../assets/img/images/landing/berkeleytime.png';

function Jumbotron() {
  return (
    <div className="level landing-jumbo">
      <div className="level-left has-text-centered">
        <div className="landing-jumbo-heading">
          <h1>BerkeleyTime</h1>
          <p>Course discovery, simplified.</p>
          <div className="landing-jumbo-buttons">
            <button type="button" className="button is-info is-rounded landing-jumbo-explore"><Link to="/catalog">Explore courses now</Link></button>
            <button type="button" className="button is-rounded has-text-info landing-jumbo-signup">Sign Up</button>
          </div>
        </div>
      </div>
      <div className="has-text-centered">
        <img className="landing-jumbo-img" src={logo} alt="jumbotron" />
      </div>
    </div>
  );
}

export default Jumbotron;
