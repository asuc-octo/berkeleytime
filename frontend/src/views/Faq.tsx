import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { Button } from 'bt/custom';

import QuestionCard from 'components/Faq/QuestionCard';

const Faq: FC = () => (
  <div className="faq">
    <Container className="mt-5">
      <Row className="mb-5">
        <Col xs={12} lg={{ span: 6, offset: 3 }} className="faq-heading">
          <h3 className="bt-h3 bt-bold mb-3">Frequently Asked Questions</h3>
          <p className='bt-p mb-3'>Answering your most commonly asked questions.</p>
          <Button variant="inverted" href="mailto: octo.berkeleytime@asuc.org">
            Contact Us
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={{ span: 6, offset: 3 }}>
          {questions.map((item, index) => (
            <QuestionCard key={index} question={item.question} answer={item.answer} />
          ))}
        </Col>
      </Row>
    </Container>
  </div>
);

const questions = [
  {
    question: 'Where does Berkeleytime get its data? Is it accurate?',
    answer: (
      <p className='bt-p'>
        We source all our historic course and enrollment data directly from Berkeley&apos;s{' '}
        <a href="https://sis.berkeley.edu/">Student Information System</a>
        &apos;s Course and Class APIs. We source grade data from{' '}
        <a href="https://calanswers.berkeley.edu/">CalAnswers</a>. Let us know if anything seems off!
      </p>
    ),
  },
  {
    question: 'Why does an enrollment chart show more than 100% students enrolled?',
    answer: (
      <p className='bt-p'>
        This is not a bug; the percent enrolled graph compares the number of students enrolled at a given time to the
        current enrollment cap of the class. Throughout the semester, professors or department admins may choose to
        decrease the class size below the number of students enrolled to limit further enrollment. Hence, some classes
        may show over 100% enrollment at certain points in the enrollment timeline.{' '}
      </p>
    ),
  },
  {
    question: 'How can I contact the Berkeleytime team?',
    answer: (
      <p className='bt=p'>
        Any questions or concerns that you have can be directed to{' '}
        <a href="mailto: octo.berkeleytime@asuc.org">octo.berkeleytime@asuc.org</a>.
      </p>
    ),
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: (
      <p className='bt-p'>
        All of our data is made available to our users as soon as it is published by the school. For class information,
        this typically occurs 2 weeks before the start of Phase I. Grades data is typically published 2-3 months after
        the end of the semester. Enrollment data is refreshed continuously as students enroll and drop classes
        throughout the semester.
      </p>
    ),
  },
  {
    question: 'Is anyone actively working on Berkeleytime?',
    answer: (
      <p className='bt-p'>
        Yes, we&apos;re a student-run organization on campus under the{' '}
        <a href="https://octo.asuc.org//">ASUC Office of the CTO</a>. Our team meets weekly to maintain and improve the
        site. You can learn more about us <Link to="/about">here</Link>!
      </p>
    ),
  },
  {
    question: 'How do I apply to join the team?',
    answer: (
      <p className='bt-p'>
        We typically recruit engineers and designers at the start of every fall semester. You can sign up for{' '}
        <Link to="/apply">recruitment updates</Link>. Also, keep an eye out on our{' '}
        <a href="https://www.facebook.com/berkeleytime/"> Facebook page</a> for recruitment events.
      </p>
    ),
  },
  {
    question: 'I want to help user test new features!',
    answer: (
      <p className='bt-p'>
        We love to hear it! You can sign up to receive <Link to="/usertesting">user testing opportunity updates</Link>.
      </p>
    ),
  },
  {
    question: 'Berkeleytime is down/I found a bug!',
    answer: (
      <p className='bt-p'>
        Remain calm! If you find an issue with the site or data, please let us know by submitting a{' '}
        <Link to="/bugs" className="link">
          bug report
        </Link>
        , and one of our on-call engineers will try to get to it as soon as possible.
      </p>
    ),
  },
  {
    question: 'Can I access your API for a project I’m working on?',
    answer: (
      <p className='bt-p'>
        Unfortunately we discontinued our backend API as of April 30th, 2021. Please{' '}
        <a href="mailto: octo.berkeleytime@asuc.org">email us</a> and we can direct you to the data sources we use for
        our API.
      </p>
    ),
  },
  {
    question: 'How do I give feedback about the product?',
    answer: (
      <p className='bt-p'>
        Feel free to fill out our{' '}
        <Link to="/bugs" className="link">
          feedback form
        </Link>
        . You can also email us at <a href="mailto: octo.berkeleytime@asuc.org">octo.berkeleytime@asuc.org</a>, and
        we&apos;ll respond as soon as we can.
      </p>
    ),
  },
  {
    question: 'Can Berkeleytime add a feature to review/rate professors and courses?',
    answer: (
      <p className='bt-p'>
        We appreciate the feature request! The BT team has discussed this at length, and, unfortunately, we are not able
        to offer any such review or rating system at the current time. This is because we work closely with the Berkeley
        Academic Senate. Also as a part of the ASUC, we cannot officially incorporate or endorse opinions we either
        don’t moderate or are not our own.
      </p>
    ),
  },
];

export default Faq;
