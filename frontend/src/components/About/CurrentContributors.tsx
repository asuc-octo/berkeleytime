import React, { FC } from 'react';
import { Row, Col } from 'react-bootstrap';

import { H3 } from 'bt/custom';

import { ReactComponent as Web } from '../../assets/svg/about/web.svg';

import ethan_1 from 'assets/img/about/2022-23/ethan_1.jpg';
import ethan_2 from 'assets/img/about/2022-23/ethan_2.jpg';
import michelle_1 from 'assets/img/about/2022-23/michelle_1.jpg';
import michelle_2 from 'assets/img/about/2022-23/michelle_2.jpg';
import william_1 from 'assets/img/about/2022-23/william_1.jpg';
import william_2 from 'assets/img/about/2022-23/william_2.jpg';
import levi_1 from 'assets/img/about/2022-23/levi_1.jpg';
import zachary_1 from 'assets/img/about/2022-23/zachary_1.jpeg';
import zachary_2 from 'assets/img/about/2022-23/zachary_2.jpg';
import henric_1 from 'assets/img/about/2022-23/henric_1.jpg';
import henric_2 from 'assets/img/about/2022-23/henric_2.jpg';
import matthew_1 from 'assets/img/about/2022-23/matthew_1.jpg';
import matthew_2 from 'assets/img/about/2022-23/matthew_2.jpg';
import kevin_1 from 'assets/img/about/2022-23/kevin_1.jpg';
import kevin_2 from 'assets/img/about/2022-23/kevin_2.jpg';
import eric_1 from 'assets/img/about/2022-23/eric_1.jpg';
import eric_2 from 'assets/img/about/2022-23/eric_2.jpg';
import joel_1 from 'assets/img/about/2022-23/joel_1.jpg';

const contributors = [
  [
    {
      name: 'Kevin Wang',
      role: 'Product Manager and Backend Engineer',
      site: 'https://kevwang.dev/',
      img: kevin_1,
      silly_img: kevin_2,
    },
    {
      name: 'Zachary Zollman',
      role: 'Backend Lead',
      site: 'https://zacharyzollman.com/',
      img: zachary_1,
      silly_img: zachary_2,
    },
    {
      name: 'Matthew Rowland',
      role: 'Frontend Lead',
      img: matthew_1,
      silly_img: matthew_2,
    },
    {
      name: 'Henric Zhang',
      role: 'Frontend Engineer',
      img: henric_1,
      silly_img: henric_2,
    },
    {
      name: 'Ethan Ikegami',
      role: 'Backend Engineer',
      site: 'https://ethanikegami.com/',
      img: ethan_1,
      silly_img: ethan_2,
    },
    {
      name: 'William Tang',
      role: 'Backend Engineer',
      site: 'https://www.linkedin.com/in/william-tang-cal/',
      img: william_1,
      silly_img: william_2,
    },
    {
      name: 'Levi Kline',
      role: 'Frontend Engineer',
      site: 'https://levibkline.com',
      img: levi_1,
      silly_img: levi_1,
    },
    {
      name: 'Eric Xu',
      role: 'Backend Engineer',
      img: eric_1,
      silly_img: eric_2,
    },
    {
      name: 'Michelle Tran',
      role: 'Designer',
      site: 'https://michelletran.design',
      img: michelle_1,
      silly_img: michelle_2,
    },
    {
      name: 'Joel Jaison',
      role: 'Frontend Engineer',
      img: joel_1,
      silly_img: joel_1
    }
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
