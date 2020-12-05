import React, { Component } from 'react';
import Markdown from 'react-markdown';
import {
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Description extends Component {

  constructor(props) {
    super(props);
    this.state = {
      body: '',
    };
  }

  componentDidMount() {
    fetch(this.props.bodyURL)
      .then(response => response.text())
      .then(text => this.setState({body: text}));
  }

  render() {
    const {body} = this.state;
    const {title, link, linkName} = this.props;

    return (
      <div className="positions">
        <Container>
          <Row>
            <Col lg={2}></Col>
            <Col lg={8}>
              <div className="positions-heading">
                <h2>{title}</h2>
              </div>
             <Markdown source={ body } escapeHTML={false} className="positions-body" />
            </Col>
            <Col lg={2}></Col>
            <LinkBar link={link} linkName={linkName} />
          </Row>
        </Container>
      </div>
    );
  }
}

export function LinkBar(props) {
  const {link, linkName} = props;

  return (
    <div className="positions-bar">
      <Button className="position-button" variant="bt-primary" size="bt-md" as={Link} to={link}>{linkName} &rarr; </Button>
    </div>
  );
}
