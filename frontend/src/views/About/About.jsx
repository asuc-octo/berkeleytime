import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import CurrentContributors from '../../components/Contributors/CurrentContributors';
import PastContributors from '../../components/Contributors/PastContributors';

import doe from '../../assets/img/images/about/group/doe.jpg';
import michaels from '../../assets/img/images/about/group/michaels.jpg';
import retreat from '../../assets/img/images/about/group/retreat.jpg';
import janet_jemma from '../../assets/img/images/about/group/janet_jemma.jpg';
import will from '../../assets/img/images/about/group/will.jpg';
import jemma from '../../assets/img/images/about/group/jemma.jpg';
import christina_janet from '../../assets/img/images/about/group/christina_janet.jpg';

import growth from '../../assets/svg/about/growth.svg';
import curiosity from '../../assets/svg/about/curiosity.svg';
import passion from '../../assets/svg/about/passion.svg';

class About extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="about">
        <h5 className="title">The Berkeleytime Team</h5>
        <img src={doe} className="teampic" />
        <div className="about-us">
          <h5>About Our Team</h5>
          <p>
            We're a small group of student volunteers at UC Berkeley, dedicated to
            simplifying the course discovery experience. We actively build, improve
            and maintain Berkeleytime.
          </p>
        </div>
        <div className="values">
          <h5>Our Values</h5>
          <Row>
            {values.map(value => (
              <Col xs={12} s={12} md={4} lg={4} className="value">
                <img src={value.svg} />
                <h6>{ value.name }</h6>
                <p>{ value.desc }</p>
              </Col>
            ))}
          </Row>
        </div>
        <div className="group">
          <img src={janet_jemma} />
          <img src={michaels} />
          <img src={retreat} />
          <img src={will} />
          <img src={jemma} />
          <img src={christina_janet} />
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
      name: "Growth",
      desc: "We're passionate about the personal and professional growth of our members. You'll grow your skills as you tackle challenging design and engineering problems.",
    },
    {
      svg: curiosity,
      name: "Curiosity",
      desc: "We value team members that are curious about solving difficult problems. We aren't afraid to fail and seek out innovative solutions indepedently.",
    },
    {
      svg: passion,
      name: "Passion",
      desc: "Berkeleytime is a living, breathing product that is continuing to evolve. Genuine commitment and dedication to the product is critical to moving Berkeleytime forward.",
    }
  ],
}

export default About;
