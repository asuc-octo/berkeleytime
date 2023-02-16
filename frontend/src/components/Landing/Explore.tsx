import React, { FC } from 'react'
import { Row, Col } from 'react-bootstrap'

import { H3, H6, P } from 'bt/custom'

import course from '../../assets/svg/landing/courses.svg'
import grade from '../../assets/svg/landing/grades.svg'
import history from '../../assets/svg/landing/history.svg'

const Explore: FC = () => (
  <div className="landing-explore">
    <h3 className="bt-h3 bt-bold mb-5">Our Features</h3>
    <Row>
      <Col xs={12} md={4} className="feature">
        <img src={course} className="mb-4" alt="courses" />
        <h6 className='bt-h6 bt-bold mb-3'>Course Catalog</h6>
        <P>Search through 12,000+ courses at Berkeley. Apply filters for requirements.</P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <img src={grade} className="mb-4" alt="grades" />
        <h6 className='bt-h6 bt-bold mb-3'>Grade Distributions</h6>
        <P>View and compare grade distributions for each course and semester.</P>
      </Col>
      <Col xs={12} md={4} className="feature">
        <img src={history} className="mb-4" alt="history" />
        <h6 className='bt-h6 bt-bold mb-3'>Enrollment History</h6>
        <P>Track accurate, real-time course enrollment trends and history.</P>
      </Col>
    </Row>
  </div>
)

export default Explore
