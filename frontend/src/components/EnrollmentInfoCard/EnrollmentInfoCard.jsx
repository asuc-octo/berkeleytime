import { PureComponent } from 'react';

import {
  getEnrollmentDay,
  applyIndicatorEnrollment
} from '../../utils/utils';

class EnrollmentInfoCard extends PureComponent {
  render() {
    const {title, subtitle, semester, instructor,
      selectedPoint, telebears,
      color, enrolledMax, waitlistedMax} = this.props;

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
