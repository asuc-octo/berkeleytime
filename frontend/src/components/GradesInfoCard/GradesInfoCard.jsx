import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function GraphInfoCard({
    classNum, semester, faculty, title, courseAvg,
    sectionAvg, seventeenth, seventeenthName, seventeenthCount,
    seventeenthGrade, seventeenthPercent
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
            <div>{courseAvg}</div>
          </Col>
          <Col xs={6} className="classAvgStats">
            <div>{sectionAvg}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            {seventeenth}
            <div className="classStatsName">{`${seventeenthName} Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{seventeenthCount}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{seventeenthGrade}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${seventeenthPercent} %`}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            {seventeenth}
            <div className="classStatsName">{`${seventeenthName} Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{seventeenthCount}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{seventeenthGrade}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${seventeenthPercent} %`}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            {seventeenth}
            <div className="classStatsName">{`${seventeenthName} Percentile`}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classCount">{seventeenthCount}</div>
          </Col>
        </Row>
        <Row>
          <Col xs={8} className="classAvgs">
            <div className="classGrade">{seventeenthGrade}</div>
          </Col>
          <Col xs={4} className="classAvgs">
            <div className="classPercent">{`${seventeenthPercent} %`}</div>
          </Col>
        </Row>
      </div>
    </div>
  );
}