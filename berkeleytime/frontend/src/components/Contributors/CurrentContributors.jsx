import React from 'react';
import FontAwesome from 'react-fontawesome';

import scott from '../../assets/img/images/about/scott.jpg';
import katharine from '../../assets/img/images/about/katharine.jpg';
import tony from '../../assets/img/images/about/tony.jpg';
import alan from '../../assets/img/images/about/alan.jpg';
import kate from '../../assets/img/images/about/kate.jpg';
import jemma from '../../assets/img/images/about/jemma.png';
import michael from '../../assets/img/images/about/michael.jpg';
import flora from '../../assets/img/images/about/flora.jpg';
import will from '../../assets/img/images/about/will.png';

function CurrentContributors({ contributors }) {
  return (
    <section className="contributors">
      <div className="contributors-container">
          <div className="contributors-description">
              <h4>About Us</h4>
              <p>We are a group of dedicated Berkeley students committed to making Berkeley a little united for everyone.</p>
          </div>

          <div className="contributor-profiles container is-fluid">
              <div className="columns is-multiline">
                  {contributors.map((member, idx) => (
                      <div className="column is-one-third is-justified">
                          <div className="card contributor-card">
                              <div className="contributor-pic-container">
                                  <img className="contributor-pic" src={member.image}></img>
                              </div>
                              <div className="contributor-desc">
                                  <h5 className="contributor-name">{member.name}</h5>
                                  <p className="contributor-role">{member.role}</p>
                                  <p className="contributor-major">{member.major}</p>
                                  <FontAwesome className="contributor-link" name="link" size="2x"/>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="card contributor-join-card">
              <h4>Join Our Team!</h4>
              <p>We're looking for great talent, so don't hesistate to reach out</p>
          </div>
      </div>
  </section>
);
}

CurrentContributors.defaultProps = {
  contributors: [
    {
      name: 'Scott Lee',
      role: 'PM & Data Scientist',
      major: "CS & Statistics '20",
      link: '',
      image: scott,
    },
    {
      name: 'Katherine Jiang',
      role: 'Engineering Lead',
      major: "CS '19",
      link: '',
      image: katharine,
    },
    {
      name: 'Tony Situ',
      role: 'Engineering Lead',
      major: "EECS '18",
      link: '',
      image: tony,
    },
    {
      name: 'Alan Rosenthal',
      role: 'Full Stack Engineer',
      major: "Applied Math & CS '20",
      link: '',
      image: alan,
    },
    {
      name: 'Kate Xu',
      role: 'Full Stack Engineer',
      major: "CS & ORMS '19",
      link: '',
      image: kate,
    },
    {
      name: 'Jemma Kwak',
      role: 'Design Lead',
      major: "Cognitive Science '20",
      link: '',
      image: jemma,
    },
    {
      name: 'Michael Li',
      role: 'Full Stack Engineer',
      major: "M.E.T '21",
      link: '',
      image: michael,
    },
    {
      name: 'Flora Xue',
      role: 'Full Stack Engineer',
      major: "CS '19",
      link: '',
      image: flora,
    },
    {
      name: 'Will Wang',
      role: 'Full Stack Engineer',
      major: "EECS '20",
      link: '',
      image: will,
    },
  ],
};

export default CurrentContributors;
