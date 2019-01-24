import React from 'react';
import CurrentContributors from '../../components/Contributors/CurrentContributors.jsx';
import PastContributors from '../../components/Contributors/PastContributors.jsx';

function About() {
  return(
      <div className="app-container">
          <div className="columns is-centered">
              <CurrentContributors></CurrentContributors>
          </div>
          <div className="columns is-centered">
              <PastContributors></PastContributors>
          </div>
      </div>
  );
}

export default About;
