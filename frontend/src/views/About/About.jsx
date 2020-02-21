import React from 'react';
import CurrentContributors from '../../components/Contributors/CurrentContributors';
import PastContributors from '../../components/Contributors/PastContributors';

function About() {
  return (
    <div className="about">
      <div className="title">
        <h5>The Berkeleytime Team</h5>
        <p>Who we are, and why we're here.</p>
      </div>
      <CurrentContributors />
      <PastContributors />
    </div>
  );
}

export default About;
