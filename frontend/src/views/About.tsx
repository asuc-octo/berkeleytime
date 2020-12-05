import React, { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3, P } from 'bt/custom'

import CurrentContributors from '../components/About/CurrentContributors';
import PastContributors from '../components/About/PastContributors';

import doe from 'assets/img/about/group/doe.jpg'
import michaels from 'assets/img/about/group/michaels.jpg'
import retreat from 'assets/img/about/group/retreat.jpg'
import grace_janet from 'assets/img/about/group/grace_janet.jpg'
import will from 'assets/img/about/group/will.jpg'
import jemma from 'assets/img/about/group/jemma.jpg'
import christina_janet from 'assets/img/about/group/christina_janet.jpg'
import retreat_silly from 'assets/img/about/group/retreat_silly.png'
import zoom from 'assets/img/about/group/zoom.png'

import growth from 'assets/svg/about/growth.svg'
import curiosity from 'assets/svg/about/curiosity.svg'
import passion from 'assets/svg/about/passion.svg'

const values = [
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
    desc: 'Genuine commitment and dedication are critical to moving the Stanfurdtime product forward.',
  },
]

const About: FC = () => (
  <div className="about">
    <div className="about-our-team my-5">
      <H3 bold className="mb-2">About Our Team</H3>
      <P className="mb-3">
        We&apos;re a small tech firm contracted by Stanfurd, dedicated to
        simplifying the course discovery experience. We actively build, improve
        and maintain Stanfurdtime.
      </P>
      {/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
    </div>
    <div className="group mb-5">
      <img src={retreat_silly} />
      <img src={zoom} />
      <img src={doe} />
      <img src={grace_janet} />
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
)

export default About;
