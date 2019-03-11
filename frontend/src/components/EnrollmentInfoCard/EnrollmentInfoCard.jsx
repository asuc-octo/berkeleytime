import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function EnrollmentInfoCard({thisClass, selectedPt, today}) {
  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">
            {thisClass.title}
          </div>
        </Row>
        <Row>
          <div className="classInfo">
            {`${thisClass.semester} | ${thisClass.faculty}`}
          </div>
        </Row>
        <Row>
          <div className="classTitle">{thisClass.subtitle}</div>
        </Row>

        <Row className="class-stats">
          <div className="classStatType">
            {`Adjustment Period: Day ${selectedPt.day}`}
          </div>
          <div className="classAdjustmentPercent">
            {`Enrollment Percent: ${selectedPt.enrolled_percent}%`}
          </div>
          <div className="classAdjustmentPercent">
            {`Waitlist Percent: ${selectedPt.waitlisted_percent}%`}
          </div>
          <Row>
            <Col xs={8}>
              <div className="classStatsName">Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{selectedPt.enrolled}</div>
            </Col>
          </Row>
          <Row className="class-stats">
            <Col xs={8}>
              <div className="classStatsName">Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{selectedPt.waitlisted}</div>
            </Col>
          </Row>
        </Row>

        <Row>
          <div className="classStatType">{`Today: ${today}`}</div>
          <div className="classAdjustmentPercent">{`${thisClass[thisClass.length-1].enrolled_percent}%`}</div>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{thisClass[thisClass.length-1].enrolled}</div>
            </Col>
          </Row>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="stats-name">{thisClass[thisClass.length-1].waitlisted}</div>
            </Col>
          </Row>
        </Row>
      </div>
    </div>
  );
}
