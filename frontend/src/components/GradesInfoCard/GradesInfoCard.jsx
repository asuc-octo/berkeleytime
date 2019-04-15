import React from 'react';
import { Row, Col } from 'react-bootstrap';

/** Accepts a percentile between 0 and 1, converts it to a string. */
function percentileToString(percentile) {
  if (percentile === 1) {
    return '100th';
  }
  if (percentile === 0) {
    return '0th';
  }
  var str = `${percentile}`.padEnd(4, '0').slice(2);
  if (str[0] === '0') {
    if (str[1] === '1') {
      return str[1] + 'th';
    } else if (str[1] === '2') {
      return str[1] + 'nd';
    } else if (str[1] === '3') {
      return str[1] + 'rd';
    } else {
      return str[1] + 'th';
    }
  } else {
    if (str[1] === '1' && str[0] !== '1') {
      return str + 'th';
    } else if (str[1] === '2' && str[0] !== '1') {
      return str + 'nd';
    } else if (str[1] === '3' && str[0] !== '1') {
      return str + 'rd';
    } else {
      return str + 'th';
    }
  }
}

function getGradeColor(grade) {
  if(grade.includes('A') || grade ==='P') {
    return 'bt-green-text';
  } else if (grade.includes('B')) {
    return 'bt-orange-text';
  } else {
    return 'bt-red-text';
  }
}

export default function GradesInfoCard({
  course, subtitle, semester, instructor, courseLetter,
  courseGPA, sectionLetter, sectionGPA, selectedGrade,
  gradeName, denominator, betterGrade, worseGrade,
  hoveredColor
}) {
  return (
    <div className="card grades-card-info">
      <div className="content card-info">
        <Row>
          <div className="class-num" style={{borderBottom: `5px ${hoveredColor} solid`}}>
            {course}
          </div>
        </Row>
        <Row>
          <div className="class-info">{`${semester} | ${instructor}`}</div>
        </Row>
        <Row>
          <div className="class-title">{subtitle}</div>
        </Row>

        <Row className="class-avgs">
          <Col xs={6} className="class-avgs">
            <div className="class-course-avg">Course Average</div>
          </Col>
          <Col xs={6} className="class-avgs">
            <div className="class-section-avg">Section Average</div>
          </Col>
        </Row>

        <Row className="class-avgs">
          <Col xs={6} className="class-avg-stats">
            <div>
              <span className={getGradeColor(courseLetter)}>{courseLetter}</span>
              <span>{` (GPA: ${courseGPA})`}</span>
            </div>
          </Col>
          <Col xs={6} className="class-avg-stats">
            <div>
              <span className={getGradeColor(sectionLetter)}>{sectionLetter}</span>
              <span>{` (GPA: ${sectionGPA})`}</span>
            </div>
          </Col>
        </Row>

        {/* <Row>
          <Col xs={8} className="class-avgs">
            <div className="class-stats-name">
              {betterGrade !== undefined && betterGrade !== null &&
                `${betterGrade.percentile_low*100}th - ${betterGrade.percentile_high*100}th Percentile`}
              </div>
          </Col>
          <Col xs={4} className="class-avgs">
            <div className="class-count">
              {betterGrade !== undefined && betterGrade !== null &&
                `${betterGrade.numerator}/${thisClass.denominator}`}
              </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="class-avgs">
            <div className="class-grade">
              {betterGrade !== undefined && betterGrade !== null &&
                betterGrade.grade_name}
            </div>
          </Col>
          <Col xs={4} className="class-avgs">
            <div className="class-percent">
              {betterGrade !== undefined && betterGrade !== null &&
                `${betterGrade.percent*100} %`}
            </div>
          </Col>
        </Row> */}

        <Row>
          <Col xs={6} className="class-avgs">
            <div className="class-stats-name">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${percentileToString(selectedGrade.percentile_low)} - ${percentileToString(selectedGrade.percentile_high)} Percentile`}
            </div>
          </Col>
          <Col xs={6} className="class-avgs">
            <div className="class-count">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${selectedGrade.numerator}/${denominator}`}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={6} className="class-avgs">
            <div className={`class-grade ${getGradeColor(gradeName)}`}>
              {selectedGrade !== undefined && selectedGrade !== null &&
                gradeName}
            </div>
          </Col>
          <Col xs={6} className="class-avgs">
            <div className="class-percent">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${Number.parseFloat(selectedGrade.numerator/denominator * 100).toFixed(2)} %`}
            </div>
          </Col>
        </Row>

        {/* <Row>
          <Col xs={8} className="class-avgs">
            <div className="class-stats-name">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.percentile_low*100}th - ${worseGrade.percentile_high*100}th Percentile`}
            </div>
          </Col>
          <Col xs={4} className="class-avgs">
            <div className="class-count">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.numerator}/${thisClass.denominator}`}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="class-avgs">
            <div className="class-grade">
              {worseGrade !== undefined && worseGrade !== null &&
                worseGrade.grade_name}
            </div>
          </Col>
          <Col xs={4} className="class-avgs">
            <div className="class-percent">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.percent*100} %`}
            </div>
          </Col>
        </Row> */}

      </div>
    </div>
  );
}
