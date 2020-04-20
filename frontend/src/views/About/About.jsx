import React, { PureComponent } from 'react';
import { Row, Col, ButtonToolbar } from 'react-bootstrap';

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
            We're a small group of student volunteers at UC Berkeley, dedicated to
            simplifying the course discovery experience. We actively build, improve
            and maintain Berkeleytime.
          </p>
        </div>
        <ButtonToolbar className="releases-heading-button">
          <a href="/join" role="button">
            <button className="btn btn-bt-blue-inverted btn-bt-md">
              Join Team
            </button>
          </a>
        </ButtonToolbar>
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
              <Col xs={12} s={12} md={4} lg={4} className="value">
                <img src={value.svg} />
                <h6>{ value.name }</h6>
                <p>{ value.desc }</p>
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
      name: "Growth",
      desc: "You’ll grow your technical skills as you tackle real challenging design and engineering problems.",
    },
    {
      svg: curiosity,
      name: "Curiosity",
      desc: "We value team members that are curious about solving difficult problems and seek out solutions independently.",
    },
    {
      svg: passion,
      name: "Passion",
      desc: "Genuine commitment and dedication are critical to moving the Berkeleytime product forward.",
    }
  ],
}

export default About;
