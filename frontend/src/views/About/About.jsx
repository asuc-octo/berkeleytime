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
      <div className="about-us">
        <h5>About Us</h5>
        <p>
          We're a small group of student volunteers at UC Berkeley, dedicated to
          simplifying the course discovery experience. We actively build, improve
          and maintain Berkeleytime.
        </p>
      </div>
      <CurrentContributors />
      <PastContributors />
    </div>
  );
}

export default About;
