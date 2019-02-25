import React from 'react';
import { Row, Col } from 'react-bootstrap';

function EnrollmentInfoCard({
  classNum,
  semester,
  faculty,
  title,
  day,
  adjustmentPercent,
  adjustmentEnrolled,
  adjustmentWaitlisted,
  today,
  todayPercent,
  todayEnrolled,
  todayWaitlisted,
}) {
  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">
            {classNum}
          </div>
        </Row>
        <Row>
          <div className="classInfo">
            {`${semester} | ${faculty}`}
          </div>
        </Row>
        <Row>
          <div className="classTitle">{title}</div>
        </Row>
        <Row className="class-stats">
          <div className="classStatType">
            {`Adjustment Period: Day ${day}`}
          </div>
          <div className="classAdjustmentPercent">
            {`${adjustmentPercent}%`}
          </div>
          <Row>
            <Col xs={8}>
              <div className="classStatsName">Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{adjustmentEnrolled}</div>
            </Col>
          </Row>
          <Row className="class-stats">
            <Col xs={8}>
              <div className="classStatsName">Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{adjustmentWaitlisted}</div>
            </Col>
          </Row>
        </Row>
        <Row>
          <div className="classStatType">{`Today: ${today}`}</div>
          <div className="classAdjustmentPercent">{`${todayPercent}%`}</div>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="classStats">{todayEnrolled}</div>
            </Col>
          </Row>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="classStatsName">Currently Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="stats-name">{todayWaitlisted}</div>
            </Col>
          </Row>
        </Row>
      </div>
    </div>
  );
}

export default EnrollmentInfoCard;
