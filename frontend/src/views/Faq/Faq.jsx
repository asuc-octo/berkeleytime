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
                  <a className="btn btn-bt-blue-inverted btn-bt-md" role="button" href = "mailto: octo.berkeley@asuc.org">Contact Us</a>
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
    answer: <p>BerkeleyTime sources our historic course data directly from Berkeley <a className="link" href="https://sis.berkeley.edu/">
      Student Information System</a>'s Course and Enrollment APIs. We source grade data
      from <a className="link" href="https://calanswers.berkeley.edu/">CalAnswers</a>.</p>
  },
  {
    question: 'How can I contact Berkeleytime?',
    answer: <p>Any questions or concerns that you have can be directed to <a className="link" href="mailto: octo.berkeley@asuc.org">
      octo.berkeley@asuc.org</a>.</p>
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: <p>All of our data is made available to our users as soon as it is published by the school. For class information,
      this typically occurs 2 weeks before the start of Phase I. Grades data is typically published 2-3 months after the end of
      the semester. Enrollment data is refreshed continuously as students enroll and drop classes.</p>
  },
  {
    question: 'Is anyone actively working on Berkeleytime?',
    answer: <p>We’re here! Our team here at UC Berkeley is continually working to deliver you all the best experience in
      selecting the courses you need to exceed. You can learn more about us <a className="link" href="/about">here</a>.</p>
  },
  {
    question: 'How do I apply to join the team?',
    answer: <p>BerkeleyTime typically recruits students to work with our team at the start of every fall semester.
      Keep an eye out during the first couple of weeks of fall semester for any announcements about our recruitment.</p>
  },
  {
    question: 'Berkeleytime stopped working. Now what?',
    answer: <p>Remain calm! If you find an issue with the site or data, please let us know by submitting
      a <a className="link" href="https://goo.gl/forms/HDQ10XBDHJ0aCjhf1">bug report</a>.</p>
  },
  {
    question: 'Can I access your API for a project I’m working on?',
    answer: <p>Yes! Our backend API is open and available for anyone to use. You can read the
      documentation <a className="link" href="/apidocs">here</a></p>
  },
  {
    question: 'How do I give the Berkeleytime team feedback?',
    answer: <p>Email us at <a className="link" href = "mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>!</p>
  },
  {
    question: 'I’m a student. How can I help the team out?',
    answer: <p>The best way for you to help is to report any bugs that you see on our platform so that we can continue
      to provide everyone with the most accurate and up to date data.</p>
  },
];


export default Faq;
