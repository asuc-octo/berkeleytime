import React, { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3 } from 'bt/custom';

import { ReactComponent as Web } from '../../assets/svg/about/web.svg';

import annie_1 from 'assets/img/about/2020-21/annie_1.jpg';
import annie_2 from 'assets/img/about/2020-21/annie_2.jpg';
import christina_1 from 'assets/img/about/2020-21/christina_1.jpg';
import christina_2 from 'assets/img/about/2020-21/christina_2.jpg';
import hiroshi_1 from 'assets/img/about/2020-21/hiroshi_1.jpg';
import hiroshi_2 from 'assets/img/about/2020-21/hiroshi_2.jpg';
import kevin_1 from 'assets/img/about/2020-21/kevin_1.jpg';
import kevin_2 from 'assets/img/about/2020-21/kevin_2.jpg';
import shuming_1 from 'assets/img/about/2020-21/shuming_1.jpg';
import shuming_2 from 'assets/img/about/2020-21/shuming_2.jpg';
import vihan_1 from 'assets/img/about/2020-21/vihan_1.jpg';
import vihan_2 from 'assets/img/about/2020-21/vihan_1.jpg';
import danji_1 from 'assets/img/about/2020-21/danji_1.png';
import danji_2 from 'assets/img/about/2020-21/danji_2.png';

const contributors = [
  [
    {
      name: 'Kevin Wang',
      role: 'Product Manager',
      site: 'https://kevwang.dev/',
      img: kevin_1,
      silly_img: kevin_2,
    },
    {
      name: 'Hiroshi Usui',
      role: 'Backend Lead',
      site: 'https://i-am.2se.xyz',
      img: hiroshi_1,
      silly_img: hiroshi_2,
    },
    {
      name: 'Danji Liu',
      role: 'Design Lead',
      site: 'https://www.linkedin.com/in/danji-liu/',
      img: danji_1,
      silly_img: danji_2,
    },
    {
      name: 'Christina Shao',
      role: 'Frontend Engineer',
      site: 'https://christinashao.github.io/',
      img: christina_1,
      silly_img: christina_2,
    },
  ],
  [
    {
      name: 'Shuming Xu',
      role: 'Backend Engineer',
      site: 'https://shumingxu.com/',
      img: shuming_1,
      silly_img: shuming_2,
    },
    {
      name: 'Annie Pan',
      role: 'Designer',
      site: 'http://anniexpan.com',
      img: annie_1,
      silly_img: annie_2,
    },
    {
      name: 'Vihan Bhargava',
      role: 'Frontend Engineer',
      site: 'https://vihan.org',
      img: vihan_1,
      silly_img: vihan_2,
    },
  ],
];

const CurrentContributors: FC = () => (
  <div className="current-contributors mb-5">
    <H3 bold className="mb-4">
      Current Team
    </H3>
    {contributors.map((row, i) => (
      <Row key={i}>
        {row.map((member) => (
          <Col key={member.name} xs={6} md={3} className="contributor-card">
            <div className="headshot">
              <img className="serious" src={member.img} alt={member.name} />
              <img src={member.silly_img} alt={member.name} />
            </div>
            <div className="name">
              <p className="bt-light-bold">{member.name}</p>
              {member.site ? (
                <a href={member.site}>
                  <Web />
                </a>
              ) : null}
            </div>
            <div className="role">{member.role}</div>
          </Col>
        ))}
      </Row>
    ))}
  </div>
);

export default CurrentContributors;
