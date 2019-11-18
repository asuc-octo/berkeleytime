import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonToolbar
} from 'react-bootstrap';

import Log from '../../components/Releases/Log';

class Releases extends Component {
  render() {
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
              {Releases.logs.map(item => <Log {...item} />)}
            </Col>
            <Col lg={2}></Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Releases.logs = [
  {
    date: 'September 5th, 2019',
    whatsNew: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor", 
               "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
               "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore"],
    fixes: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
            "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."]
  },
  {
    date: 'September 5th, 2019',
    whatsNew: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
               "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
               "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore"],
    fixes: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
            "Incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."]
  },
];

export default Releases;