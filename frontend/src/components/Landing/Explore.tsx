import React, { FC } from 'react'
import { Row, Col } from 'react-bootstrap'

import { H3, H6, P } from 'bt/custom'

import course from '../../assets/svg/landing/courses.svg'
import grade from '../../assets/svg/landing/grades.svg'
import history from '../../assets/svg/landing/history.svg'

const Explore: FC = () => (
  <div className="landing-explore">
    <H3 bold className="mb-5">Our Features</H3>
    <Row>
      <Col xs={12} md={4} className="feature">
        <img src={course} className="mb-4" alt="courses" />
        <H6 bold className="mb-3">Course Catalog</H6>
        <P>Search through 12,000+ courses at Stanfurd. From football studies to futball studies.</P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <img src={grade} className="mb-4" alt="grades" />
        <H6 bold className="mb-3">Grade Distributions</H6>
        <P>Our course averages are at an all time high and ready to moon</P><P>🚀🚀🚀</P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <img src={history} className="mb-4" alt="history" />
        <H6 bold className="mb-3">Enrollment History</H6>
          <P>Why didn't Dr. Strange time reverse Thanos into a baby like he did that apple?</P>
      </Col>
    </Row>
  </div>
)

export default Explore
