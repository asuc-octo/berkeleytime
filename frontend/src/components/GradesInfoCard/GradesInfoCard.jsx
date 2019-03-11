import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function GraphInfoCard({thisClass, selectedGrade, betterGrade, worseGrade}) {

  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">
            {thisClass.title}
          </div>
        </Row>
        <Row>
          <div className="classInfo">
            {`${thisClass.semester} | ${thisClass.faculty}`}
          </div>
        </Row>
        <Row>
          <div className="classTitle">
            {thisClass.subtitle}
          </div>
        </Row>

        <Row className="classAvgs">
          <Col xs={6} className="classAvgs">
            <div className="classCourseAvg">Course Average</div>
          </Col>
          <Col xs={6} className="classAvgs">
            <div className="classSectionAvg">Section Average</div>
          </Col>
        </Row>

        <Row className="classAvgs">
          <Col xs={6} className="classAvgStats">
            <div>
              {`${thisClass.course_letter} (GPA: ${thisClass.course_gpa})`}
            </div>
          </Col>
          <Col xs={6} className="classAvgStats">
            <div>
              {`${thisClass.section_letter} (GPA: ${thisClass.section_gpa})`} 
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">
              {betterGrade !== undefined && betterGrade !== null && 
                `${betterGrade.percentile_low*100}th - ${betterGrade.percentile_high*100}th Percentile`}
              </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">
              {betterGrade !== undefined && betterGrade !== null && 
                `${betterGrade.numerator}/${thisClass.denominator}`}
              </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">
              {betterGrade !== undefined && betterGrade !== null && 
                betterGrade.grade_name}
            </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">
              {betterGrade !== undefined && betterGrade !== null && 
                `${betterGrade.percent*100} %`}
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${selectedGrade.percentile_low*100}th - ${selectedGrade.percentile_high*100}th Percentile`}
            </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${selectedGrade.numerator}/${thisClass.denominator}`}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">
              {selectedGrade !== undefined && selectedGrade !== null &&
                selectedGrade.grade_name}
            </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">
              {selectedGrade !== undefined && selectedGrade !== null &&
                `${selectedGrade.percent*100} %`}
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.percentile_low*100}th - ${worseGrade.percentile_high*100}th Percentile`}
            </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.numerator}/${thisClass.denominator}`}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">
              {worseGrade !== undefined && worseGrade !== null &&
                worseGrade.grade_name}
            </div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">
              {worseGrade !== undefined && worseGrade !== null &&
                `${worseGrade.percent*100} %`}
            </div>
          </Col>
        </Row>
        
      </div>
    </div>
  );
}