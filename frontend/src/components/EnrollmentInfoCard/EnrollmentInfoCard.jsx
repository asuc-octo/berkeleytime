import React, { PureComponent } from 'react';
import { Row, Col } from 'react-bootstrap';

import {
  getEnrollmentDay,
  applyIndicatorEnrollment
} from '../../utils/utils';

class EnrollmentInfoCard extends PureComponent {
  render() {
    const {title, subtitle, semester, instructor,
      selectedPoint, todayPoint, telebears,
      color, enrolledMax, waitlistedMax} = this.props;

    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('en-US', dateOptions);

    let { period, daysAfterPeriodStarts } = getEnrollmentDay(selectedPoint, telebears); 

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
            <span className="text">Enrolled:</span> {applyIndicatorEnrollment(selectedPoint.enrolled, enrolledMax, selectedPoint.enrolled_percent)}
          </div>
          <div className="waitlisted-stat">
            <span className="text">Waitlisted:</span> {applyIndicatorEnrollment(selectedPoint.waitlisted, waitlistedMax, selectedPoint.waitlisted_percent)}
          </div>
        </div>

      </div>
    );
  }
}

export default EnrollmentInfoCard;
