import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import web from '../../assets/svg/about/web.svg';

class PastContributors extends PureComponent {
  render() {
    const { sections } = this.props;

    return (
      <div className="past-contributors">
        <h5>Alumni</h5>
        {sections.map(section => (
          <div className="section">
            <h6>{ section.name }</h6>
            {section.rows.map(row => (
              <Row>
                {row.map(member => (
                  <Col xs={6} lg={3} className="contributor-card">
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
        ))}
      </div>
    );
  }
}

PastContributors.defaultProps = {
  sections: [
    {
      name: 'Class of 2019',
      rows: [
        [
          {
            name: 'Evelyn Li',
            role: 'Backend Engineer',
          },
          {
            name: 'Richard Liu',
            role: 'Backend Engineer',
          },
          {
            name: 'Mary Liu',
            role: 'Backend Engineer',
          },
          {
            name: 'Kate Xu',
            role: 'Frontend Lead',
            site: 'https://www.linkedin.com/in/kate-shijie-xu-666b57110',
          }
        ],
      ]
    },
    {
      name: 'Founders',
      rows: [
        [
          {
            name: 'Yuxin Zhu',
            site: 'http://yuxinzhu.com/',
          },
          {
            name: 'Noah Gilmore',
            site: 'https://noahgilmore.com',
          },
          {
            name: 'Ashwin Iyengar',
            site: 'https://nms.kcl.ac.uk/ashwin.iyengar/',
          }
        ]
      ]
    }
  ],
  pastContributors: [
    {
      name: 'Alan Rosenthal',
      site: 'https://www.linkedin.com/in/alan-rosenthal-37767614a/',
    },
    {
      name: 'Christine Wang',
      site: 'https://www.linkedin.com/in/cwang395/',
    },
    {
      name: 'Emily Chen',
      site: null,
    },
    {
      name: 'Kate Xu',
      site: 'https://www.linkedin.com/in/kate-shijie-xu-666b57110/',
    },
    {
      name: 'Eric Huynh',
      site: 'http://erichuynhing.com',
    },
    {
      name: 'Flora Xue',
      site: 'https://www.linkedin.com/in/flora-zhenruo-xue/',
    },
    {
      name: 'Jennifer Yu',
      site: null,
    },
    {
      name: 'Justin Lu',
      site: null,
    },
    {
      name: 'Katharine Jiang',
      site: 'http://katharinejiang.com',
    },
    {
      name: 'Kelvin Leong',
      site: 'https://www.linkedin.com/in/kelvinjleong/',
    },
    {
      name: 'Kevin Jiang',
      site: 'https://github.com/kevjiangba',
    },
    {
      name: 'Kimya Khoshnan',
      site: null,
    },
    {
      name: 'Laura Harker',
      site: null,
    },
    {
      name: 'Mihir Patil',
      site: null,
    },
    {
      name: 'Niraj Amalkanti',
      site: null,
    },
    {
      name: 'Parsa Attari',
      site: null,
    },
    {
      name: 'Ronald Lee',
      site: null,
    },
    {
      name: 'Sanchit Bareja',
      site: null,
    },
    {
      name: 'Sandy Zhang',
      site: null,
    },
    {
      name: 'Scott Lee',
      site: 'http://scottjlee.github.io',
    },
    {
      name: 'Tony Situ',
      site: 'https://www.linkedin.com/in/c2tonyc2/',
    },
    {
      name: 'Vaibhav Srikaran',
      site: 'https://www.linkedin.com/in/vsrikaran/',
    },
  ],
};

export default PastContributors;
