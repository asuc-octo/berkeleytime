import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonToolbar
} from 'react-bootstrap';
import yaml from 'js-yaml';

import Log from '../../components/Releases/Log';

class Releases extends Component {

  constructor(props) {
    super(props);
    this.state = {
      releases: [],
    };
  }

  componentDidMount() {
    fetch("/assets/releases.yaml")
      .then(result => result.text())
      .then(data => this.setState({ releases: yaml.load(data).releases }));
  }

  render() {
    const { releases } = this.state;
    return (
      <div className="releases">
        <Container>
          <Row>
            <Col lg={3}></Col>
            <Col lg={6}>
              <div className="releases-heading">
                <h2>Stanfurdtime Releases</h2>
                <h3>Keep up-to-date with our releases and bug fixes.</h3>
                <ButtonToolbar className="releases-heading-button">
                  <a href="/bugs">
                    <button className="btn btn-bt-blue-inverted btn-bt-md">
                      Give Feedback
                    </button>
                  </a>
                </ButtonToolbar>
              </div>
            </Col>
            <Col lg={3}></Col>
          </Row>
          <Row>
            <Col lg={3}></Col>
            <Col lg={6}>
              {releases.map(item => <Log {...item} />)}
            </Col>
            <Col lg={3}></Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Releases;
