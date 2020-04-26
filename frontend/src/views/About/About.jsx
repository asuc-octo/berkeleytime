import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';

import CurrentContributors from '../../components/Contributors/CurrentContributors';
import PastContributors from '../../components/Contributors/PastContributors';

import doe from '../../assets/img/images/about/group/doe.jpg';
import michaels from '../../assets/img/images/about/group/michaels.jpg';
import retreat from '../../assets/img/images/about/group/retreat.jpg';
import janet_jemma from '../../assets/img/images/about/group/janet_jemma.jpg';
import will from '../../assets/img/images/about/group/will.jpg';
import jemma from '../../assets/img/images/about/group/jemma.jpg';
import christina_janet from '../../assets/img/images/about/group/christina_janet.jpg';
import retreat_silly from '../../assets/img/images/about/group/retreat_silly.png';
import zoom from '../../assets/img/images/about/group/zoom.png';

import growth from '../../assets/svg/about/growth.svg';
import curiosity from '../../assets/svg/about/curiosity.svg';
import passion from '../../assets/svg/about/passion.svg';

class About extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="about">
        <div className="about-us">
          <h5>About Our Team</h5>
          <p>
            We&apos;re a small group of student volunteers at UC Berkeley, dedicated to
            simplifying the course discovery experience. We actively build, improve
            and maintain Berkeleytime.
          </p>
          <Button variant="bt-primary-inverted" size="bt-md" as={Link} to="/join">Join Team</Button>
        </div>
        <div className="group">
          <img src={retreat_silly} />
          <img src={zoom} />
          <img src={doe} />
          <img src={janet_jemma} />
          <img src={retreat} />
          <img src={christina_janet} />
          <img src={michaels} />
          <img src={will} />
          <img src={jemma} />
        </div>
        <div className="values">
          <h5>Our Values</h5>
          <Row>
            {values.map(value => (
              <Col xs={12} md={4} className="value-col">
                <div className="value">
                  <div className="value-content">
                    <img src={value.svg} alt="value" />
                    <h6>{ value.name }</h6>
                    <p>{ value.desc }</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <CurrentContributors />
        <PastContributors />
      </div>
    );
  }
}

About.defaultProps = {
  values: [
    {
      svg: growth,
      name: 'Growth',
      desc: 'You’ll grow your technical skills as you tackle real challenging design and engineering problems.',
    },
    {
      svg: curiosity,
      name: 'Curiosity',
      desc: 'We value team members that are curious about solving difficult problems and seek out solutions independently.',
    },
    {
      svg: passion,
      name: 'Passion',
      desc: 'Genuine commitment and dedication are critical to moving the Berkeleytime product forward.',
    },
  ],
};

export default About;
