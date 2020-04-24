import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import web from '../../assets/svg/about/web.svg';
import yaml from 'js-yaml';

class PastContributors extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
    };
  }

  componentDidMount() {
    fetch("/assets/members.yaml")
      .then(members => members.text())
      .then(data => this.setState({ sections: yaml.load(data).past }));
  }

  render() {
    const { sections } = this.state;
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
                      ) : null }
                    </div>
                      { member.role ? (
                        <div className="role">{member.role}</div>
                      ) : null }
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

export default PastContributors;
