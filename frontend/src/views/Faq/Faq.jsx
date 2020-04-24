import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
            <Col lg={3}></Col>
            <Col md={6}>
              <div className="faq-heading">
                <h2>Frequently Asked Questions</h2>
                <h3>Answering your most commonly asked questions.</h3>
                <ButtonToolbar className="faq-heading-button">
                <a href = "mailto: octo.berkeley@asuc.org">
                  <button className="btn btn-bt-blue-inverted btn-bt-md" role="button" >Contact Us</button>
                </a>

                </ButtonToolbar>
              </div>
            </Col>
            <Col lg={3}></Col>
          </Row>
          <Row>
            <Col lg={3}></Col>
            <Col md={6}>
              {Faq.questions.map(item => <QuestionCard question={item.question} answer={item.answer} />)}
            </Col>
            <Col lg={3}></Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Faq.questions = [
  {
    question: 'Where does Berkeleytime get its data? Is it accurate?',
    answer: <p>We source all our historic course and enrollment data directly from Berkeley <a className="link" href="https://sis.berkeley.edu/">
      Student Information System</a>'s Course and Class APIs. We source grade data
      from <a className="link" href="https://calanswers.berkeley.edu/">CalAnswers</a>. Let us know if anything seems off!</p>
  },
  {
    question: 'How can I contact the Berkeleytime team?',
    answer: <p>Any questions or concerns that you have can be directed to <a className="link" href="mailto: octo.berkeley@asuc.org">
      octo.berkeley@asuc.org</a>.</p>
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: <p>All of our data is made available to our users as soon as it is published by the school. For class information,
      this typically occurs 2 weeks before the start of Phase I. Grades data is typically published 2-3 months after the end of
      the semester. Enrollment data is refreshed continuously as students enroll and drop classes throughout the semester.</p>
  },
  {
    question: 'Is anyone actively working on Berkeleytime?',
    answer: <p>Yes, we're a student-run organization here on campus under the <a className="link" href="https://octo.asuc.org//">
      ASUC Office of the CTO</a>. Our team meets weekly to maintain and improve the site. You can learn more about
      us <Link to="/about" className="link">here</Link>!</p>
  },
  {
    question: 'How do I apply to join the team?',
    answer: <p>We typically recruit engineers and designers at the start of every fall semester; keep an eye out on our website and our <a className="link" href = "https://www.facebook.com/berkeleytime/">Facebook page</a> for updates.</p>
  },
  {
    question: 'Berkeleytime is down/I found a bug!',
    answer: <p>Remain calm! If you find an issue with the site or data, please let us know by submitting
      a <Link to="/bugs" className="link">bug report</Link>, and one of our on-call engineers will try to get to it as soon as possible.</p>
  },
  {
    question: 'Can I access your API for a project I’m working on?',
    answer: <p>Yes! Our backend API is officially open and available for anyone to use. You can read the
      documentation <a className="link" href="/apidocs">here</a>.</p>
  },
  {
    question: 'How do I give feedback about the product?',
    answer: <p>Feel free to fill out our <Link to="/bugs" className="link">feedback form</Link>. You can also email us at <a className="link" href = "mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>, and we'll respond as soon as we can.  </p>
  },
];


export default Faq;
