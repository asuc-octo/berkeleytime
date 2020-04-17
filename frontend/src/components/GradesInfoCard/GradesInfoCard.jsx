import React, { PureComponent } from 'react';

import {
  percentileToString,
  getGradeColor
} from '../../utils/utils';

class GradesInfoCard extends PureComponent {
  render() {
    const {
      course, subtitle, semester, instructor,
      courseLetter, courseGPA, sectionLetter,
      sectionGPA, selectedPercentiles, selectedGrade,
      denominator, betterGrade, worseGrade, color
    } = this.props;

    return (
      <div className="grades-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <div className="course">{ course }</div>
        </div>
        <div className="title">{ subtitle }</div>
        <div className="info">{ `${semester} • ${instructor}` }</div>
        <h6>Course Average</h6>
        <div className="course-average">
          <span className={getGradeColor(courseLetter)}>{ courseLetter }</span>
          ({ courseGPA })
        </div>
        <h6>Section Average</h6>
        <div className="section-average">
          <span className={getGradeColor(sectionLetter)}>{ sectionLetter }</span>
          ({ sectionGPA })
        </div>
        {selectedGrade !== undefined && selectedGrade !== null && selectedPercentiles !== undefined && selectedPercentiles !== null && selectedPercentiles.numerator !== 0 && (
          <div>
            <h6>
              {`${percentileToString(selectedPercentiles.percentile_low)}-${percentileToString(selectedPercentiles.percentile_high)} Percentile`}
            </h6>
            <div className="percentile">
              <span className={getGradeColor(selectedGrade)}>{ selectedGrade }</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default GradesInfoCard;
