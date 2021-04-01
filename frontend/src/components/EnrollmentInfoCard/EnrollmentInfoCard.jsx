import React, { PureComponent } from 'react';

import {
  getEnrollmentDay,
  applyIndicatorEnrollment
} from '../../utils/utils';

import { H5, H6, P } from 'bt/custom';

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
          <H5 bold className="course">{ title }</H5>
        </div>
        <P className="title">{ subtitle }</P>
        <P className="info">{ `${semester} • ${instructor}` }</P>

        <div className="stat-section">
          <H6 bold className="date">{daysAfterPeriodStarts} Days After {period}</H6>
          <div className="enrolled-stat">
            <span className="text">Enrolled:</span>{applyIndicatorEnrollment(selectedPoint.enrolled, enrolledMax, selectedPoint.enrolled_percent)}
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
