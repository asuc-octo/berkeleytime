import React from 'react';
import { Col } from 'react-bootstrap';

import {
  getGradeColor
} from '../../utils/utils';

function ClassCardMobile(props) {
  const {
    courseLetter, courseGPA, sectionLetter, sectionGPA,
  } = props;

  const nullCheck = (e) => {
    return e !== undefined && e !== null;
  }

  return (
    <div className="class-card-mobile">
      <div className="class-card-mobile-column">
        <h6>Course Average</h6>
        {nullCheck(courseLetter) ? 
          <div>
            <span className={getGradeColor(courseLetter)}>{courseLetter}</span>
            (GPA: {courseGPA})
          </div>
        :
        "--"}
      </div>
      <div className="class-card-mobile-column">
        <h6>Section Average</h6>
         {nullCheck(sectionLetter) ? 
          <div>
            <span className={getGradeColor(sectionLetter)}>{sectionLetter}</span>
            (GPA: {sectionGPA})
          </div>
          :
          "--"}
      </div>
    </div> 
  );
}

export default ClassCardMobile;