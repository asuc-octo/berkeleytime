import React, { FC } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'

import { H3, P, Button } from 'bt/custom'

import QuestionCard from 'components/Faq/QuestionCard'

const Faq: FC = () => (
  <div className="faq">
    <Container className="mt-5">
      <Row className="mb-5">
        <Col xs={12} lg={{ span: 6, offset: 3 }} className="faq-heading">
          <H3 bold className="mb-3">Frequently Asked Questions</H3>
          <P className="mb-3">Answering your most commonly asked questions.</P>
          <Button variant="inverted" href="mailto: octo.stanfurdtime@asuc.org">
            Contact Us
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={{ span: 6, offset: 3 }}>
          {questions.map(item => <QuestionCard question={item.question} answer={item.answer} />)}
        </Col>
      </Row>
    </Container>
  </div>
)

const questions = [
  {
    question: 'Where does Stanfurdtime get its data? Is it accurate?',
    answer: <P>We source all our historic course and enrollment data by asking our friends and making educated guesses to fill the gaps.</P>,
  },
  {
    question: 'Why does an enrollment chart show more than 100% students enrolled?',
    answer: <P>You can make more money by enrolling more students than capacity. Its simple math. </P>,
  },
  {
    question: 'How can I contact the Stanfurdtime team?',
    answer: <P>Any questions or concerns that you have can be directed to <a href="mailto: octo.berkeleytime@asuc.org">junk+stanfurdtime@stanfurd.edu</a>.</P>,
  },
  {
    question: 'When are grades/classes/enrollment data released?',
    answer: (
      <P>
        Just file a JIRA ticket and we will prioritize it during Q3 planning.
      </P>
    ),
  },
  {
    question: 'Stanfurdtime is down/I found a bug!',
    answer: <P>Our contract does not require we make any quality or availability guarantees.</P>,
  },
  {
    question: 'How do I give feedback about the product?',
    answer: <P>Send mail to 450 Jane Stanford Way, Stanford, CA 94305 and we will get back to you within 4-6 weeks.</P>,
  }, {
    question: 'Can Stanfurdtime add a feature to review/rate professors and courses?',
    answer: <P>Lets not pretend you actually go to class.</P>
  }
];

export default Faq
