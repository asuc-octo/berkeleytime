import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';

import QuestionCard from '../../components/Faq/QuestionCard';


class Faq extends PureComponent {
  render() {
    return (
      <div className="faq">
        <Container>
          <Row>
            <Col xs={12} lg={{ span: 6, offset: 3 }}>
              <div className="faq-heading">
                <h2>Frequently Asked Questions</h2>
                <h3>Answering your most commonly asked questions.</h3>
                <a className="btn btn-bt-primary-inverted btn-bt-md" href="mailto: octo.berkeley@asuc.org">
                  Contact Us
                </a>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={{ span: 6, offset: 3 }}>
              {Faq.questions.map(item => <QuestionCard question={item.question} answer={item.answer} />)}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Faq.questions = [
  {
    question: 'Where does Berkeleytime get its data? Is it accurate?',
    answer: <p>We source all our historic course and enrollment data directly from Berkeley
      <a href="https://sis.berkeley.edu/">Student Information System</a>&apos;s Course and Class APIs. We source grade
      data from <a className="link" href="https://calanswers.berkeley.edu/">CalAnswers</a>. Let us know if anything seems off!</p>,
  },
  {
    question: 'Why does an enrollment chart show more than 100% students enrolled?',
    answer: <p>This is not a bug; the percent enrolled graph compares the number of students enrolled at a given time to the current
      enrollment cap of the class. Throughout the semester, professors or department admins may choose to decrease the class
      size below the number of students enrolled to limit further enrollment. Hence, some classes may show over 100%
      enrollment at certain points in the enrollment timeline. </p>,
  },
  {
    question: 'How can I contact the Berkeleytime team?',
    answer: <p>Any questions or concerns that you have can be directed to <a href="mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>.</p>,
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: (
      <p>
        All of our data is made available to our users as soon as it is published by the school. For class information,
        this typically occurs 2 weeks before the start of Phase I. Grades data is typically published 2-3 months after the end of
        the semester. Enrollment data is refreshed continuously as students enroll and drop classes throughout the semester.
      </p>
    ),
  },
  {
    question: 'Is anyone actively working on Berkeleytime?',
    answer: <p>Yes, we&apos;re a student-run organization on campus under the <a href="https://octo.asuc.org//">ASUC
      Office of the CTO</a>. Our team meets weekly to maintain and improve the site. You can learn more about us
      <Link to="/about">here</Link>!</p>,
  },
  {
    question: 'How do I apply to join the team?',
    answer: <p>We typically recruit engineers and designers at the start of every fall semester. You can sign up for
      <a href="/join">recruitment updates</a>. Also, keep an eye out on our <a href="https://www.facebook.com/berkeleytime/">
        Facebook page</a> for recruitment events.</p>,
  },
  {
    question: 'I want to help user test new features!',
    answer: <p>We love to hear it! You can sign up to receive <a href="/usertesting">user testing opportunity updates</a>.</p>,
  },
  {
    question: 'Berkeleytime is down/I found a bug!',
    answer: <p>Remain calm! If you find an issue with the site or data, please let us know by submitting a <Link to="/bugs">
      bug report</Link>, and one of our on-call engineers will try to get to it as soon as possible.</p>,
  },
  {
    question: 'Can I access your API for a project I’m working on?',
    answer: <p>Yes! Our <a href="/apidocs">backend API</a> is officially open and available for anyone to use.</p>,
  },
  {
    question: 'How do I give feedback about the product?',
    answer: <p>Feel free to fill out our <Link to="/bugs" className="link">feedback form</Link>. You can also email us
      at <a href="mailto: octo.berkeley@asuc.org">octo.berkeley@asuc.org</a>, and we&apos;ll respond as soon as we can.</p>,
  },
];


export default Faq;
