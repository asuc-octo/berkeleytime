import React from 'react';
import CurrentContributors from '../../components/Contributors/CurrentContributors.jsx';
import PastContributors from '../../components/Contributors/PastContributors.jsx';

function About() {
  return(
      <div>
        <div className="app-container">
          <CurrentContributors></CurrentContributors>
         </div>
          <PastContributors></PastContributors>
      </div>
  );
}

export default About;
