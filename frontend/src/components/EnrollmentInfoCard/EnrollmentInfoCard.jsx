import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function EnrollmentInfoCard({
  title, subtitle, semester, instructor, selectedPoint, todayPoint
}) {
  const today = new Date();
  let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const todayString = today.toLocaleDateString("en-US", dateOptions);
  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">
            {title}
          </div>
        </Row>
        <Row>
          <div className="classInfo">
            {`${semester} | ${instructor}`}
          </div>
        </Row>
        <Row>
          <div className="classTitle">{subtitle}</div>
        </Row>

        <Row className="class-stats">
          <div className="classStatType">
            {`Adjustment Period: Day ${selectedPoint.day}`}
          </div>
          <div className="classAdjustmentPercent">
            {`Enrollment Percent: ${selectedPoint.enrolled_percent}%`}
          </div>
          <div className="classAdjustmentPercent">
            {`Waitlist Percent: ${selectedPoint.waitlisted_percent}%`}
          </div>
          <Row>
            <Col xs={8}>
              <div className="classStatsName">Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{selectedPoint.enrolled}</div>
            </Col>
          </Row>
          <Row className="class-stats">
            <Col xs={8}>
              <div className="classStatsName">Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{selectedPoint.waitlisted}</div>
            </Col>
          </Row>
        </Row>

        <Row>
          <div className="classStatType">{`Today: ${todayString}`}</div>
          <div className="classAdjustmentPercent">{`${todayPoint.enrolled_percent}%`}</div>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{todayPoint.enrolled}</div>
            </Col>
          </Row>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="stats-name">{todayPoint.waitlisted}</div>
            </Col>
          </Row>
        </Row>
      </div>
    </div>
  );
}
