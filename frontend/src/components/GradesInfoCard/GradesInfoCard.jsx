import React, { PureComponent } from 'react';

/** Accepts a percentile between 0 and 1, converts it to a string. */
function percentileToString(percentile) {
  if (percentile === 1) {
    return '100th';
  }
  if (percentile === 0) {
    return '0th';
  }
  const str = `${percentile}`.padEnd(4, '0').slice(2);
  if (str[0] === '0') {
    if (str[1] === '1') {
      return `${str[1]}st`;
    } else if (str[1] === '2') {
      return `${str[1]}nd`;
    } else if (str[1] === '3') {
      return `${str[1]}rd`;
    } else {
      return `${str[1]}th`;
    }
  } else if (str[1] === '1' && str[0] !== '1') {
    return `${str}st`;
  } else if (str[1] === '2' && str[0] !== '1') {
    return `${str}nd`;
  } else if (str[1] === '3' && str[0] !== '1') {
    return `${str}rd`;
  } else {
    return `${str}th`;
  }
}

function getGradeColor(grade) {
  if (grade.includes('A') || grade === 'P') {
    return 'bt-indicator-green';
  } else if (grade.includes('B')) {
    return 'bt-indicator-orange';
  } else {
    return 'bt-indicator-red';
  }
}

class GradesInfoCard extends PureComponent {
  render() {
    const {
      course, subtitle, semester, instructor,
      courseLetter, courseGPA, sectionLetter,
      sectionGPA, selectedPercentiles, selectedGrade,
      denominator, betterGrade, worseGrade, color,
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
        {selectedPercentiles !== undefined && selectedPercentiles !== null && selectedPercentiles.numerator !== 0 && (
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
