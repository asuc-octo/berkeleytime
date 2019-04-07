import React from 'react';
import { Row, Col } from 'react-bootstrap';

function formatPercentage(num) {
  return (num * 100).toFixed(0);
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
  course, title, semester, instructor, courseLetter,
  courseGPA, sectionLetter, sectionGPA, selectedGrade,
  gradeName, denominator, betterGrade, worseGrade
}) {
  return (
    <div className="card grades-card-info">
      <div className="content card-info">
        <Row>
          <div className="class-num">{course}</div>
        </Row>
        <Row>
          <div className="class-info">{`${semester} | ${instructor}`}</div>
        </Row>
        <Row>
          <div className="class-title">{title}</div>
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
                `${formatPercentage(selectedGrade.percentile_low)}th
                - ${formatPercentage(selectedGrade.percentile_high)}th Percentile`}
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
                `${formatPercentage(selectedGrade.percent)}%`}
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