import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import web from '../../assets/svg/about/web.svg';

import leon_1 from '../../assets/img/images/about/compressed/Leon_1.jpg';
import leon_2 from '../../assets/img/images/about/compressed/Leon_2.jpg';
import michael_1 from '../../assets/img/images/about/compressed/Michael_1.jpg';
import michael_2 from '../../assets/img/images/about/compressed/Michael_2.jpg';
import will_1 from '../../assets/img/images/about/compressed/Will_1.jpg';
import will_2 from '../../assets/img/images/about/compressed/Will_2.jpg';
import jemma_1 from '../../assets/img/images/about/compressed/Jemma_1.jpg';
import jemma_2 from '../../assets/img/images/about/compressed/Jemma_2.jpg';
import chris_1 from '../../assets/img/images/about/compressed/Chris_1.jpg';
import chris_2 from '../../assets/img/images/about/compressed/Chris_2.jpg';
import sangbin_1 from '../../assets/img/images/about/compressed/Sangbin_1.jpg';
import sangbin_2 from '../../assets/img/images/about/compressed/Sangbin_2.jpg';
import anson_1 from '../../assets/img/images/about/compressed/Anson_1.jpg';
import anson_2 from '../../assets/img/images/about/compressed/Anson_2.jpg';
import eli_1 from '../../assets/img/images/about/compressed/Eli_1.jpg';
import grace_1 from '../../assets/img/images/about/compressed/Grace_1.jpg';
import grace_2 from '../../assets/img/images/about/compressed/Grace_2.jpg';
import hannah_1 from '../../assets/img/images/about/compressed/Hannah_1.jpg';
import hannah_2 from '../../assets/img/images/about/compressed/Hannah_2.jpg';
import chloe_1 from '../../assets/img/images/about/compressed/Chloe_1.jpg';
import chloe_2 from '../../assets/img/images/about/compressed/Chloe_2.jpg';
import christina_1 from '../../assets/img/images/about/compressed/Christina_1.jpg';
import christina_2 from '../../assets/img/images/about/compressed/Christina_2.jpg';
import sean_1 from '../../assets/img/images/about/compressed/Sean_1.jpg';
import sean_2 from '../../assets/img/images/about/compressed/Sean_2.jpg';
import izzie_1 from '../../assets/img/images/about/compressed/Izzie_1.jpg';
import izzie_2 from '../../assets/img/images/about/compressed/Izzie_2.jpg';
import janet_1 from '../../assets/img/images/about/compressed/Janet_1.jpg';
import janet_2 from '../../assets/img/images/about/compressed/Janet_2.jpg';
import annie_1 from '../../assets/img/images/about/compressed/Annie_1.jpg';
import annie_2 from '../../assets/img/images/about/compressed/Annie_2.jpg';


class CurrentContributors extends PureComponent {
  render() {
    let { contributors } = this.props;

    return (
      <div className="current-contributors">
        <h5>Current Team</h5>
        {contributors.map(row => (
          <Row>
            {row.map(member => (
              <Col xs={6} lg={3} className="contributor-card">
                <div className="headshot">
                  <img className="serious" src={member.img_1} alt={member.name} />
                  <img src={member.silly ? member.img_2 : member.img_1} alt={member.name} />
                </div>
                <div className="name">
                  <p>{ member.name }</p>
                  { member.site ? (
                    <a href={member.site}><img src={web} /></a>
                  ) : null}
                </div>
                <div className="role">{ member.role }</div>
              </Col>
            ))}
          </Row>
        ))}
      </div>
    );
  }
}

CurrentContributors.defaultProps = {
  contributors: [
    [
      {
        name: 'Leon Ming',
        role: 'ASUC CTO',
        site: 'https://leon-ming.com',
        silly: true,
        img_1: leon_1,
        img_2: leon_2,
      },
      {
        name: 'Michael Li',
        role: 'Product Manager',
        site: 'http://www.michaelli.me',
        silly: true,
        img_1: michael_1,
        img_2: michael_2,
      },
      {
        name: 'Will Wang',
        role: 'Advisor',
        site: 'http://www.hantaowang.me',
        silly: true,
        img_1: will_2,
        img_2: will_1,
      },
      {
        name: 'Jemma Kwak',
        role: 'Design Lead',
        site: 'https://jemmakwak.github.io',
        silly: true,
        img_1: jemma_1,
        img_2: jemma_2,
      },
    ],
    [
      {
        name: 'Christopher Liu',
        role: 'Frontend Lead',
        site: 'https://chrisdliu.github.io',
        silly: true,
        img_1: chris_1,
        img_2: chris_2,
      },
      {
        name: 'Sangbin Cho',
        role: 'Backend Lead',
        site: 'https://www.linkedin.com/in/sang-cho/',
        silly: true,
        img_1: sangbin_1,
        img_2: sangbin_2,
      },
      {
        name: 'Anson Tsai',
        role: 'Backend Engineering',
        site: 'https://www.linkedin.com/in/anson-tsai-83b9a312a/',
        silly: true,
        img_1: anson_1,
        img_2: anson_2,
      },
      {
        name: 'Eli Wu',
        role: 'Backend Engineering',
        silly: false,
        img_1: eli_1,
      },
    ],
    [
      {
        name: 'Grace Luo',
        role: 'Frontend Engineering',
        site: 'https://www.linkedin.com/in/g-luo',
        silly: true,
        img_1: grace_1,
        img_2: grace_2,
      },
      {
        name: 'Sean Meng',
        role: 'Backend Engineering',
        site: 'https://www.linkedin.com/in/sean-meng-berkeley',
        silly: true,
        img_1: sean_1,
        img_2: sean_2,
      },
      {
        name: 'Hannah Yan',
        role: 'Backend Engineering',
        site: 'https://www.linkedin.com/in/yanhannah',
        silly: true,
        img_1: hannah_1,
        img_2: hannah_2,
      },
      {
        name: 'Isabella Lau',
        role: 'Backend Engineering',
        site: 'https://www.linkedin.com/in/xisabellalau',
        silly: true,
        img_1: izzie_1,
        img_2: izzie_2,
      },
    ],
    [
      {
        name: 'Christina Shao',
        role: 'Frontend Engineering',
        site: 'https://www.linkedin.com/in/christina-shao',
        silly: true,
        img_1: christina_1,
        img_2: christina_2,
      },
      {
        name: 'Chloe Liu',
        role: 'Frontend Engineering',
        site: 'https://www.linkedin.com/in/ruochen99',
        silly: true,
        img_1: chloe_1,
        img_2: chloe_2,
      },
      {
        name: 'Janet Xu',
        role: 'Designer',
        site: 'https://janetxu.com',
        silly: true,
        img_1: janet_1,
        img_2: janet_2,
      },
      {
        name: 'Annie Pan',
        role: 'Designer',
        site: 'https://anniexpan.com',
        silly: true,
        img_1: annie_1,
        img_2: annie_2,
      },
    ],
  ],
};

export default CurrentContributors;
