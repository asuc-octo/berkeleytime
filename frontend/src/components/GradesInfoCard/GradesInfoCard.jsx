import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function GraphInfoCard({thisClass, selectedGrade, betterGrade, worseGrade}) {

  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">{thisClass.title}</div>
        </Row>
        <Row>
          <div className="classInfo">{`${thisClass.semester} | ${thisClass.faculty}`}</div>
        </Row>
        <Row>
          <div className="classTitle">{thisClass.subtitle}</div>
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
            <div>{`${thisClass.course_letter} (GPA: ${thisClass.course_gpa})`} </div>
          </Col>
          <Col xs={6} className="classAvgStats">
            <div>{`${thisClass.section_letter} (GPA: ${thisClass.section_gpa})`} </div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">{`${betterGrade.percentile_low}th - ${betterGrade.percentile_high}th Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{`${betterGrade.numerator}/${betterGrade.denominator}`}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{betterGrade.grade_name}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${betterGrade.percent} %`}</div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">{`${selectedGrade.percentile_low}th - ${selectedGrade.percentile_high}th Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{`${selectedGrade.numerator}/${selectedGrade.denominator}`}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{selectedGrade.grade_name}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${selectedGrade.percent} %`}</div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">{`${worseGrade.percentile_low}th - ${worseGrade.percentile_high}th Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{`${worseGrade.numerator}/${worseGrade.denominator}`}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{worseGrade.grade_name}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${worseGrade.percent} %`}</div>
          </Col>
        </Row>
        
      </div>
    </div>
  );
}