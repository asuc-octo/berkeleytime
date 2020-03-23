import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

function formatPercentage(num) {
  if (num === -1) {
    return "N/A"
  }
  return (num * 100).toFixed(1).toString() + "%";
}

class EnrollmentInfoCard extends PureComponent {
  render() {
    const {title, subtitle, semester, instructor,
      selectedPoint, todayPoint, telebears,
      color, enrolledMax} = this.props;

    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('en-US', dateOptions);

    let period = '';
    if (selectedPoint.day < telebears.phase2_start_day) {
      period = 'Phase I';
    } else if (selectedPoint.day < telebears.adj_start_day) {
      period = 'Phase II';
    } else {
      period = 'Adjustment Period';
    }
    
    return (
      <div className="enrollment-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <div className="course">{ title }</div>
        </div>
        <div className="title">{ subtitle }</div>
        <div className="info">{ `${semester} • ${instructor}` }</div>
        <div className="section">
          <h6>{selectedPoint.day} Days After {period}</h6>
          <div>
            Enrolled: {selectedPoint.enrolled}/{enrolledMax} ({selectedPoint.enrolled_percent})
          </div>
        </div>
      </div>
    );

    return (
      <div className="card enrollment-card-info">
        <div className="content card-info">
          <Row>
            <div className="class-num" style={{ borderBottom: `5px ${color} solid` }}>
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
              <Col xs={5} className="class-stats-left-col">
                <div className="class-stats-name">Enrolled</div>
              </Col>
              <Col xs={7}>
                <div className="class-stats">{selectedPoint.enrolled}/{enrolledMax}</div>
              </Col>
            </Row>
            <Row className="class-stats">
              <Col xs={5} className="class-stats-left-col">
                <div className="class-stats-name">Waitlisted</div>
              </Col>
              <Col xs={7}>
                <div className="class-stats">{selectedPoint.waitlisted}</div>
              </Col>
            </Row>
          </div>

          <div>
            <Row><div className="class-stat-type">{`Today: ${todayString}`}</div></Row>
            <Row><div className="class-adjustment-percent">{`${formatPercentage(todayPoint.enrolled_percent)}%`}</div></Row>
            <Row className="class-adjustment">
              <Col xs={5} className="class-stats-left-col">
                <div className="class-stats-name">Currently Enrolled</div>
              </Col>
              <Col xs={7}>
                <div className="class-stats">{todayPoint.enrolled}</div>
              </Col>
            </Row>
            <Row className="class-adjustment">
              <Col xs={5} className="class-stats-left-col">
                <div className="class-stats-name">Currently Waitlisted</div>
              </Col>
              <Col xs={7}>
                <div className="stats-name">{todayPoint.waitlisted}</div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default EnrollmentInfoCard;
