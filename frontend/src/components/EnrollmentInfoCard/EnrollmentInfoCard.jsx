import React from 'react';
import { Row, Col } from 'react-bootstrap';

function formatPercentage(num) {
  if (num === -1) {
    return "N/A"
  }
  return (num * 100).toFixed(1).toString() + "%";
}

export default function EnrollmentInfoCard({
  title, subtitle, semester, instructor,
  selectedPoint, todayPoint, telebears,
  hoveredColor
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

        <Row className="class-stats">
          <div className="class-stat-type">
            {`${period}: Day ${selectedPoint.day}`}
          </div>
          <div className="class-adjustment-percent">
            {`Enrollment Percent: ${formatPercentage(selectedPoint.enrolled_percent)}`}
          </div>
          <div className="class-adjustment-percent">
            {`Waitlist Percent: ${formatPercentage(selectedPoint.waitlisted_percent)}`}
          </div>
          <Row>
            <Col xs={8}>
              <div className="class-stats-name">Enrolled</div>
            </Col>
            <Col xs={4}>
              <div className="class-stats">{selectedPoint.enrolled}/{selectedPoint.enrolled_max}</div>
            </Col>
          </Row>
          <Row className="class-stats">
            <Col xs={8}>
              <div className="class-stats-name">Waitlisted</div>
            </Col>
            <Col xs={4}>
              <div className="class-stats">{selectedPoint.waitlisted}/{selectedPoint.waitlisted_max}</div>
            </Col>
          </Row>
        </Row>

        <Row>
          <div className="class-stat-type">{`Today: ${todayString}`}</div>
          <div className="class-adjustment-percent">{`${formatPercentage(todayPoint.enrolled_percent)}`}</div>
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
