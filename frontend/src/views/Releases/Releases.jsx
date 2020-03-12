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
    fetch("/releases.yaml")
      .then(result => result.text())
      .then(data => this.setState({ releases: yaml.load(data).releases }));
  }

  render() {
    const { releases } = this.state;
    return (
      <div className="releases">
        <Container>
          <Row>
            <Col lg={2}></Col>
            <Col lg={8}>
              <div className="releases-heading">
                <h2>Berkeleytime Releases</h2>
                <h3>Keep up-to-date with our releases and bug fixes.</h3>
                <ButtonToolbar className="releases-heading-button">
                  <a className="btn btn-bt-red-inverted btn-bt-md" href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1" role="button">Report a Bug</a>
                </ButtonToolbar>
              </div>
            </Col>
            <Col lg={2}></Col>
          </Row>
          <Row>
            <Col lg={2}></Col>
            <Col lg={8}>
              {releases.map(item => <Log {...item} />)}
            </Col>
            <Col lg={2}></Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Releases;