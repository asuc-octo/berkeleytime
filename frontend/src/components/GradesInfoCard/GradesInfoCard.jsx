import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function GraphInfoCard({classNum, semester, faculty, title, courseAvg, courseGPA, sectionAvg, sectionGPA, denominator, selectedGrade, betterGrade, worseGrade
  }) {
  return (
    <div className="card card-info">
      <div className="content card-info">
        <Row>
          <div className="classNum">{classNum}</div>
        </Row>
        <Row>
          <div className="classInfo">{`${semester} | ${faculty}`}</div>
        </Row>
        <Row>
          <div className="classTitle">{title}</div>
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
            <div>{`${courseAvg} (GPA: ${courseGPA})`} </div>
          </Col>
          <Col xs={6} className="classAvgStats">
            <div>{`${sectionAvg} (GPA: ${sectionGPA})`} </div>
          </Col>
        </Row>

        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classStatsName">{`${betterGrade.percentile_low}th - ${betterGrade.percentile_high}th Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{`${betterGrade.numerator}/${denominator}`}</div>
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
            <div className="classCount">{`${selectedGrade.numerator}/${denominator}`}</div>
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
            <div className="classCount">{`${worseGrade.numerator}/${denominator}`}</div>
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