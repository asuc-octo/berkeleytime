import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function GraphCard({title, graph, info}) {
  return (
    <div className="card card-graph">
      <Row className="content">
        <div className="graphTitle">{ title }</div>
      </Row>
      <Row>
        <Col sm={8}>
          <div className="graph">{ graph }</div>
        </Col>
        <Col sm={4}>{ info }</Col>
      </Row>
    </div>
  );
}
