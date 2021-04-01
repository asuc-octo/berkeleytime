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
    question: <a href="https://real.berkeleytime.com">Where do I find the real Berkeleytime?</a>,
    answer: <P>Thanks for enjoying our April Fool's joke! You can visit
    <a href="https://real.berkeleytime.com"> real.berkeleytime.com </a>to view the unaltered Berkeleytime.</P>,
  },
  {
    question: <P>Where does Stanfurdtime get its data? Is it accurate?</P>,
    answer: <P>Most of this data is identical to Berkeleytime. Like the catalog and enrollment info is the exact same. We hardcoded A+ for all the grades.</P>,
  },
  {
    question: <P>Why does an enrollment chart show more than 100% students enrolled? </P>,
    answer: <P>You can make more money by enrolling more students than capacity. Its simple math.</P>,
  },
  {
    question: <P>How can I contact the Stanfurdtime team?</P>,
    answer: <P>Any questions or concerns that you have can be directed to <a href="mailto: octo.berkeleytime@asuc.org">junk+stanfurdtime@stanfurd.edu</a>.</P>,
  },
  {
    question: <P>When are grades/classes/enrollment data released?</P>,
    answer: (
      <P>
        Just file a JIRA ticket and we will prioritize it during Q3 planning.
      </P>
    ),
  },
  {
    question: <P>Stanfurdtime is down/I found a bug!</P>,
    answer: <P>Our contract does not require we make any quality or availability guarantees.</P>,
  },
  {
    question: <P>How do I give feedback about the product?</P>,
    answer: <P>Send mail to 450 Jane Stanfurd Way, Stanfurd, CA 94305 and we will get back to you within 4-6 business weeks.</P>,
  }, {
    question: <P>Can Stanfurdtime add a feature to review/rate professors and courses?</P>,
    answer: <P>Lets not pretend you actually go to class.</P>
  }
];

export default Faq
