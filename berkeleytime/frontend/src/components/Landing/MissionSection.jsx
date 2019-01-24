import React from 'react';
import FontAwesome from 'react-fontawesome';
import { LinkContainer } from 'react-router-bootstrap';

function MissionSection({ cardInfo }) {
  return (
    <section className="mission-section">
      <div className="mission-content">
        {cardInfo.map(item => (
          <div className="card info-card">
            <h2>{item.heading}</h2>
            <p>{item.description}</p>
            {item.linkText === 'ASUC OCTO' ? (
              <a href={item.link}>
                {item.linkText}
                <FontAwesome name="long-arrow-right" />
              </a>
            ) : (
              <LinkContainer to={item.link}>
                <a>
                  {item.linkText}
                  <FontAwesome name="long-arrow-right" />
                </a>
              </LinkContainer>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


MissionSection.defaultProps = {
    cardInfo: [
        {
            heading: 'Our Mission',
            description: 'Berkeleytime is an official organization under the ASUC Office of the Chief Technology Officer. We are dedicated to designing free, accessible software for students.',
            linkText: 'ASUC OCTO',
            link: 'http://asucocto.org/',
        },
        {
            heading: 'Who We Are',
            description: 'We are a group of dedicated developers and designers helping simplify your course selection and planning experience as seamless as possible. Designed for students, by students',
            linkText: 'About Us',
            link: '/about',
        },

    ],
};

export default MissionSection;
