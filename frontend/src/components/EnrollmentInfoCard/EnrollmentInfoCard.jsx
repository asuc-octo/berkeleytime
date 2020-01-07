import React from 'react';
import { Row, Col } from 'react-bootstrap';

function formatPercentage(num) {
  return (num * 100).toFixed(1);
}

export default function EnrollmentInfoCard({
  title, subtitle, semester, instructor,
  selectedPoint, todayPoint, telebears,
  hoveredColor, enrolledMax
}) {
  const today = new Date();
  let dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const todayString = today.toLocaleDateString("en-US", dateOptions);

  let period = "";
  if(selectedPoint.day < telebears['phase2_start_day']) {
    period = "Phase I";
  } else if (selectedPoint.day < telebears['adj_start_day']) {
    period = "Phase II";
  } else {
    period = "Adjustment Period"
  }

  return (
    <div className="card enrollment-card-info">
      <div className="content card-info">
        <Row>
          <div className="class-num" style={{borderBottom: `5px ${hoveredColor} solid`}}>
            {title}
          </div>
        </Row>
        <Row>
          <div className="class-info">
            {`${semester} | ${instructor}`}
          </div>
        </Row>
        <Row>
          <div className="class-title">{subtitle}</div>
        </Row>

        <div className="class-stats">
          <Row>
            <div className="class-stat-type">
              {`${period}: Day ${selectedPoint.day}`}
            </div>
          </Row>
          <Row>
            <div className="class-adjustment-percent">
              {`Enrollment Percent: ${formatPercentage(selectedPoint.enrolled_percent)}%`}
            </div>
          </Row>
          <Row>
            <div className="class-adjustment-percent">
              {`Waitlist Percent: ${formatPercentage(selectedPoint.waitlisted_percent)}%`}
            </div>
          </Row>
          <Row>
            <Col xs={8} className="class-stats-left-col">
              <div className="class-stats-name">Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="class-stats">{selectedPoint.enrolled}/{enrolledMax}</div>
            </Col>
          </Row>
          <Row className="class-stats">
            <Col xs={8} className="class-stats-left-col">
              <div className="class-stats-name">Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="class-stats">{selectedPoint.waitlisted}</div>
            </Col>
          </Row>
        </div>

        <Row>
          <div className="class-stat-type">{`Today: ${todayString}`}</div>
          <div className="class-adjustment-percent">{`${formatPercentage(todayPoint.enrolled_percent)}%`}</div>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="class-stats-name">Currently Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="class-stats">{todayPoint.enrolled}</div>
            </Col>
          </Row>
          <Row className="class-adjustment">
            <Col xs={8}>
              <div className="class-stats-name">Currently Waitlisted</div>
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
