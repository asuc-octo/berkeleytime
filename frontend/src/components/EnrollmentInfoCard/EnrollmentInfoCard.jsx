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
      daysAfterPeriodStarts = Math.max(selectedPoint.day - telebears.phase1_start_day, 0);
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
          <div className="date">{`Today: ${todayString}`}</div>
          <div className="enrolled-stat">
            Enrolled: {applyIndicatorColor(todayPoint.enrolled, enrolledMax, todayPoint.enrolled_percent)}
          </div>
          <div className="waitlisted-stat">
            Waitlisted: {applyIndicatorColor(todayPoint.waitlisted, waitlistedMax, todayPoint.waitlisted_percent)}
          </div>
        </div>

        <div className="stat-section">
          <div className="date">{daysAfterPeriodStarts} Days After {period}</div>
          <div className="enrolled-stat">
            Enrolled: {applyIndicatorColor(selectedPoint.enrolled, enrolledMax, selectedPoint.enrolled_percent)}
          </div>
          <div className="waitlisted-stat">
            Waitlisted: {applyIndicatorColor(selectedPoint.waitlisted, waitlistedMax, selectedPoint.waitlisted_percent)}
          </div>
        </div>

      </div>
    );

    // return (
    //   <div className="card enrollment-card-info">
    //     <div className="content card-info">
    //       <Row>
    //         <div className="class-num" style={{ borderBottom: `5px ${color} solid` }}>
    //           {title}
    //         </div>
    //       </Row>
    //       <Row>
    //         <div className="class-info">
    //           {`${semester} | ${instructor}`}
    //         </div>
    //       </Row>
    //       <Row>
    //         <div className="class-title">{subtitle}</div>
    //       </Row>
    //
    //       <div className="class-stats">
    //         <Row>
    //           <div className="class-stat-type">
    //             {`${period}: Day ${selectedPoint.day}`}
    //           </div>
    //         </Row>
    //         <Row>
    //           <div className="class-adjustment-percent">
    //             {`Enrollment Percent: ${formatPercentage(selectedPoint.enrolled_percent)}%`}
    //           </div>
    //         </Row>
    //         <Row>
    //           <div className="class-adjustment-percent">
    //             {`Waitlist Percent: ${formatPercentage(selectedPoint.waitlisted_percent)}%`}
    //           </div>
    //         </Row>
    //         <Row>
    //           <Col xs={5} className="class-stats-left-col">
    //             <div className="class-stats-name">Enrolled</div>
    //           </Col>
    //           <Col xs={7}>
    //             <div className="class-stats">{selectedPoint.enrolled}/{enrolledMax}</div>
    //           </Col>
    //         </Row>
    //         <Row className="class-stats">
    //           <Col xs={5} className="class-stats-left-col">
    //             <div className="class-stats-name">Waitlisted</div>
    //           </Col>
    //           <Col xs={7}>
    //             <div className="class-stats">{selectedPoint.waitlisted}</div>
    //           </Col>
    //         </Row>
    //       </div>
    //
    //       <div>
            // <Row><div className="class-stat-type">{`Today: ${todayString}`}</div></Row>
            // <Row><div className="class-adjustment-percent">{`${formatPercentage(todayPoint.enrolled_percent)}%`}</div></Row>
            // <Row className="class-adjustment">
            //   <Col xs={5} className="class-stats-left-col">
            //     <div className="class-stats-name">Currently Enrolled</div>
            //   </Col>
            //   <Col xs={7}>
            //     <div className="class-stats">{todayPoint.enrolled}</div>
            //   </Col>
            // </Row>
            // <Row className="class-adjustment">
            //   <Col xs={5} className="class-stats-left-col">
            //     <div className="class-stats-name">Currently Waitlisted</div>
            //   </Col>
            //   <Col xs={7}>
            //     <div className="stats-name">{todayPoint.waitlisted}</div>
            //   </Col>
            // </Row>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

export default EnrollmentInfoCard;
