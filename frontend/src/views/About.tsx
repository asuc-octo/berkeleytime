import React, { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3, H6, P, Themed } from 'bt/custom'

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

import { ReactComponent as Growth } from 'assets/svg/about/growth.svg'
import { ReactComponent as Curiosity } from 'assets/svg/about/curiosity.svg'
import { ReactComponent as Passion } from 'assets/svg/about/passion.svg'

const values = [
  {
    svg: Growth,
    name: (
      <Themed
        light={
          <>
            Growth
          </>
        }
        stanfurd={
          <>
            Trees
          </>
        }
      />
    ),
    desc: (
      <Themed
        light={
          <>
            You’ll grow your technical skills as you tackle real challenging design and engineering problems.
          </>
        }
        stanfurd={
          <>
            Stanfurd&apos;s mascot. <br />🔥 420 baby 🔥
          </>
        }
      />
    )
  },
  {
    svg: Curiosity,
    name: (
      <Themed
        light={
          <>
            Curiosity
          </>
        }
        stanfurd={
          <>
            Brilliance
          </>
        }
      />
    ),
    desc: (
      <Themed
        light={
          <>
            We value team members that are curious about solving difficult problems and seek out solutions independently.
          </>
        }
        stanfurd={
          <>
            All our members achieved 1700+ SATs, 6.0+ GPAs, and attended private boarding schools with higher tuition that most universities.
          </>
        }
      />
    )
  },
  {
    svg: Passion,
    name: (
      <Themed
        light={
          <>
            Passion
          </>
        }
        stanfurd={
          <>
            Passion
          </>
        }
      />
    ),
    desc: (
      <Themed
        light={
          <>
            You’ll grow your technical skills as you tackle real challenging design and engineering problems.
          </>
        }
        stanfurd={
          <>
            Your passion for this startup is why you must work 18 hours a day, 7 days a week for no equity and no pay.
          </>
        }
      />
    )
  },
]

const About: FC = () => (
  <div className="about">
    <div className="about-our-team my-5">
      <H3 bold className="mb-2">About Our Team</H3>
      <P className="mb-3">
        <Themed
          light={
            <>
              We&apos;re a small group of student volunteers at UC Berkeley, dedicated to
              simplifying the course discovery experience. We actively build, improve
              and maintain Berkeleytime.
            </>
          }
          stanfurd={
            <>
              We&apos;re Stanfurd&apos;s premier tech consulting club, with many alumni at FLAMINGASS
              companies. We&apos;re so prestigious we got a bunch of Berkeley kids to develop this site
              for no pay. Look how happy they are!
            </>
          }
        />
      </P>
      {/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
    </div>
    <div className="group mb-5">
      <img src={retreat_silly} alt="" />
      <img src={zoom} alt="" />
      <img src={doe} alt="" />
      <img src={grace_janet} alt="" />
      <img src={retreat} alt="" />
      <img src={christina_janet} alt="" />
      <img src={michaels} alt="" />
      <img src={will} alt="" />
      <img src={jemma} alt="" />
    </div>
    <div className="values">
      <H3 bold>Our Values</H3>
      <Row>
        {values.map((value, i) => (
          <Col key={i} xs={12} md={4} className="value-col">
            <div className="value">
              <div className="value-content">
                <value.svg />
                <H6 bold>{ value.name }</H6>
                <P>{ value.desc }</P>
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
