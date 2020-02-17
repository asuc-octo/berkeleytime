import React from 'react';
import CurrentContributors from '../../components/Contributors/CurrentContributors';
import PastContributors from '../../components/Contributors/PastContributors';

function About() {
  return (
    <div className="about">
      <CurrentContributors />
      <PastContributors />
    </div>
  );
}

export default About;
