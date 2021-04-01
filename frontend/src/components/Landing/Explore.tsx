import React, { FC } from 'react'
import { Row, Col } from 'react-bootstrap'

import { H3, H6, P, Themed } from 'bt/custom'

import { ReactComponent as Course } from '../../assets/svg/landing/courses.svg'
import { ReactComponent as Grade } from '../../assets/svg/landing/grades.svg'
import { ReactComponent as History } from '../../assets/svg/landing/history.svg'

const Explore: FC = () => (
  <div className="landing-explore">
    <H3 bold className="mb-5">Our Features</H3>
    <Row>
      <Col xs={12} md={4} className="feature">
        <Course className="mb-4" />
        <H6 bold className="mb-3">Course Catalog</H6>
        <P>
          <Themed
            light={<>Search through 12,000+ courses at Berkeley. Apply filters for requirements.</>}
            stanfurd={<>Search through 12,000+ courses at Stanfurd. From Football Studies to futball studies.</>}
          />
        </P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <Grade className="mb-4" />
        <H6 bold className="mb-3">Grade Distributions</H6>
        <P>
          <Themed
            light={<>View and compare grade distributions for each course and semester.</>}
            stanfurd={<>Stanfurd A+ Printer go brrr... Grade inflation is at an all time high, we&apos;re going to the moon <br />🚀🚀🚀</>}
          />
        </P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <History className="mb-4" />
        <H6 bold className="mb-3">Enrollment History</H6>
        <P>
          <Themed
            light={<>Track accurate, real-time course enrollment trends and history.</>}
            stanfurd={<>Do we really need to track this? We admitted like 10 people last year.</>}
          />
        </P>
      </Col>
    </Row>
  </div>
)

export default Explore
