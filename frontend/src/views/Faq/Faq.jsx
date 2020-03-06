import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  ButtonToolbar,
  Collapse,
  Button
} from 'react-bootstrap';

import QuestionCard from '../../components/FAQ/QuestionCard';


class Faq extends Component {

  constructor(props) {
    super(props);
    // this.state = {
    //   open: false
    // };

  }
  render() {
    return (
      <div className="faq">
        <Container>
          <Row>
            <Col lg={2}></Col>
            <Col lg={8}>
              <div className="faq-heading">
                <h2>Frequently Asked Questions</h2>
                <h3>Answering your most commonly asked questions.</h3>
                <ButtonToolbar className="faq-heading-button">
                  <a className="btn btn-bt-blue-inverted btn-bt-md" role="button">Contact Us</a>
                </ButtonToolbar>
              </div>
            </Col>
            <Col lg={2}></Col>
          </Row>
          <Row>
            <Col lg={2}></Col>
            <Col lg={8}>
              {Faq.questions.map(item => <QuestionCard question={item.question} answer={item.answer} />)}
            </Col>
            <Col lg={2}></Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Faq.questions = [
  {
    question: 'Where does Berkeleytime get its data? Is it accurate?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitsed do eiusmod tempor.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore'
  },
  {
    question: 'How can I contact Berkeleytime?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitsed do eiusmod tempor.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore'
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitsed do eiusmod tempor.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore'
  },
  {
    question: 'Is anyone actively working on Berkeleytime?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elitsed do eiusmod tempor.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore'
  },
];


export default Faq;
