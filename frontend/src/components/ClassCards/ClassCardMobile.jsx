import React from 'react';
import { Col } from 'react-bootstrap';

import {
  getGradeColor,
  getEnrollmentDay,
  applyIndicatorEnrollment,
} from '../../utils/utils';

function ClassCardMobile(props) {
  const { additionalInfo, type } = props;

  const nullCheck = (e) => {
    return e !== undefined && e !== null;
  }

  if (type === "grades") {
    const courseLetter = additionalInfo ? additionalInfo[0] : null;
    const courseGPA = additionalInfo ? additionalInfo[1] : null;
    const sectionLetter = additionalInfo ? additionalInfo[2] : null;
    const sectionGPA = additionalInfo ? additionalInfo[3] : null;

    return (
      <div className="class-card-mobile">
        <div className="class-card-mobile-column">
          <div class="bt-h6">Course Average</div>
          {nullCheck(courseLetter) ? 
            <div class="bt-h6">
              <span className={getGradeColor(courseLetter)}>{courseLetter}</span>
              (GPA: {courseGPA})
            </div>
          :
          "--"}
        </div>
        <div className="class-card-mobile-column">
          <div class="bt-h6">Section Average</div>
          {nullCheck(sectionLetter) ? 
            <div class="bt-h6">
              <span className={getGradeColor(sectionLetter)}>{sectionLetter}</span>
              (GPA: {sectionGPA})
            </div>
            :
            "--"}
        </div>
      </div> 
    );
  }

  else {
    const latest_point = additionalInfo ? additionalInfo[0] : null;
    const telebears = additionalInfo ? additionalInfo[1] : null;
    const enrollment_info = additionalInfo ? additionalInfo[2] : null;
    const waitlisted_info = additionalInfo ? additionalInfo[3] : null;

    let date_info = []
    if(latest_point != null && telebears != null) {
      date_info = getEnrollmentDay(latest_point, telebears); 
    }

    return (
      <div className="class-card-mobile">
        <div className="class-card-mobile-column">
          <div class="bt-h6">
            {date_info ? date_info['period'] + ": " + date_info['daysAfterPeriodStarts'] : "--"}
          </div>
          <div class="bt-h6">Enrollment Percent:
            {nullCheck(enrollment_info) ? applyIndicatorEnrollment.apply(null, enrollment_info) : "--"}
          </div> 
          <div class="bt-h6">Waitlist Percent:
            {nullCheck(waitlisted_info) ? applyIndicatorEnrollment.apply(null, waitlisted_info) : "--"}
          </div> 
        </div> 
      </div> 
    );

  }
}

export default ClassCardMobile;
