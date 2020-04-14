import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';


function formatPercentage(num) {
  if (num === -1) {
    return "N/A"
  }
  return (num * 100).toFixed(1).toString() + "%";
}

function applyIndicatorColor(enrolled, enrolledMax, percentage) {
  let theme;
  if (percentage < 0.34) {
    theme = 'bt-indicator-green';
  } else if (percentage < 0.67) {
    theme = 'bt-indicator-orange';
  } else {
    theme = 'bt-indicator-red';
  }

  return (
    <span className={theme} > {enrolled}/{enrolledMax} ({`${formatPercentage(percentage)}`})</span>
  );
}

class EnrollmentInfoCard extends PureComponent {
  render() {
    const {title, subtitle, semester, instructor,
      selectedPoint, todayPoint, telebears,
      color, enrolledMax, waitlistedMax} = this.props;

    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('en-US', dateOptions);

    let period = '';
    let daysAfterPeriodStarts = 0;
    if (selectedPoint.day < telebears.phase2_start_day) {
      period = 'Phase I';
      daysAfterPeriodStarts = selectedPoint.day - telebears.phase1_start_day;
    } else if (selectedPoint.day < telebears.adj_start_day) {
      period = 'Phase II';
      daysAfterPeriodStarts = selectedPoint.day - telebears.phase2_start_day;
    } else {
      period = 'Adjustment Period';
      daysAfterPeriodStarts = selectedPoint.day - telebears.adj_start_day;
    }

    return (
      <div className="enrollment-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <div className="course">{ title }</div>
        </div>
        <div className="title">{ subtitle }</div>
        <div className="info">{ `${semester} • ${instructor}` }</div>

        <div className="stat-section">
          <div className="date">{daysAfterPeriodStarts} Days After {period}</div>
          <div className="enrolled-stat">
            <span className="text">Enrolled:</span> {applyIndicatorColor(selectedPoint.enrolled, enrolledMax, selectedPoint.enrolled_percent)}
          </div>
          <div className="waitlisted-stat">
            <span className="text">Waitlisted:</span> {applyIndicatorColor(selectedPoint.waitlisted, waitlistedMax, selectedPoint.waitlisted_percent)}
          </div>
        </div>

      </div>
    );
  }
}

export default EnrollmentInfoCard;
