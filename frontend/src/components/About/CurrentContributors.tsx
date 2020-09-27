import React, { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3 } from 'bt/custom'

import { ReactComponent as Web } from '../../assets/svg/about/web.svg';

import leon_1 from 'assets/img/about/compressed/Leon_1.jpg';
import leon_2 from 'assets/img/about/compressed/Leon_2.jpg';
import michael_1 from 'assets/img/about/compressed/Michael_1.jpg';
import michael_2 from 'assets/img/about/compressed/Michael_2.jpg';
import chris_1 from 'assets/img/about/compressed/Chris_1.jpg';
import chris_2 from 'assets/img/about/compressed/Chris_2.jpg';
import grace_1 from 'assets/img/about/compressed/Grace_1.jpg';
import grace_2 from 'assets/img/about/compressed/Grace_2.jpg';
import hannah_1 from 'assets/img/about/compressed/Hannah_1.jpg';
import hannah_2 from 'assets/img/about/compressed/Hannah_2.jpg';
import chloe_1 from 'assets/img/about/compressed/Chloe_1.jpg';
import chloe_2 from 'assets/img/about/compressed/Chloe_2.jpg';
import christina_1 from 'assets/img/about/compressed/Christina_1.jpg';
import christina_2 from 'assets/img/about/compressed/Christina_2.jpg';
import izzie_1 from 'assets/img/about/compressed/Izzie_1.jpg';
import izzie_2 from 'assets/img/about/compressed/Izzie_2.jpg';
import janet_1 from 'assets/img/about/compressed/Janet_1.jpg';
import janet_2 from 'assets/img/about/compressed/Janet_2.jpg';
import annie_1 from 'assets/img/about/compressed/Annie_1.jpg';
import annie_2 from 'assets/img/about/compressed/Annie_2.jpg';

const contributors = [
  [
    {
      name: 'Grace Luo',
      role:  <>ASUC CTO<br/>Product Manager</>,
      site: 'https://graceluo.me',
      img: grace_1,
      silly_img: grace_2,
    },
    {
      name: 'Christopher Liu',
      role: <>Product Manager<br />Frontend Lead</>,
      site: 'https://chrisdliu.github.io',
      img: chris_1,
      silly_img: chris_2,
    },
    {
      name: 'Leon Ming',
      role: 'Backend Lead',
      site: 'https://leon-ming.com',
      img: leon_1,
      silly_img: leon_2,
    },
    {
      name: 'Janet Xu',
      role: 'Design Lead',
      site: 'https://www.linkedin.com/in/janet-xu/',
      img: janet_1,
      silly_img: janet_2,
    },
  ],
  [
    {
      name: 'Annie Pan',
      role: 'Marketing Director',
      site: 'https://anniexpan.com',
      img: annie_1,
      silly_img: annie_2,
    },
    {
      name: 'Michael Li',
      role: 'Frontend Engineer',
      site: 'http://www.michaelli.me',
      img: michael_1,
      silly_img: michael_2,
    },
    {
      name: 'Christina Shao',
      role: 'Frontend Engineer',
      site: 'https://www.linkedin.com/in/christina-shao',
      img: christina_1,
      silly_img: christina_2,
    },
    {
      name: 'Chloe Liu',
      role: 'Backend Engineer',
      site: 'https://www.linkedin.com/in/ruochen99',
      img: chloe_1,
      silly_img: chloe_2,
    },
  ],
  [
    {
      name: 'Hannah Yan',
      role: 'Backend Engineer',
      site: 'https://www.linkedin.com/in/yanhannah',
      img: hannah_1,
      silly_img: hannah_2,
    },
    {
      name: 'Isabella Lau',
      role: 'Backend Engineer',
      site: 'https://www.linkedin.com/in/xisabellalau',
      img: izzie_1,
      silly_img: izzie_2,
    },
  ],
]


const CurrentContributors: FC = () => (
  <div className="current-contributors mb-5">
    <H3 bold className="mb-4">Current Team</H3>
    {contributors.map(row => (
      <Row>
        {row.map(member => (
          <Col xs={6} md={3} className="contributor-card">
            <div className="headshot">
              <img className="serious" src={member.img} alt={member.name} />
              <img src={member.silly_img} alt={member.name} />
            </div>
            <div className="name">
              <p>{ member.name }</p>
              { member.site ? (
                <a href={member.site}><Web /></a>
              ) : null }
            </div>
            <div className="role">{ member.role }</div>
          </Col>
        ))}
      </Row>
    ))}
  </div>
)

export default CurrentContributors
