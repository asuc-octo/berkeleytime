import React from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import vars from '../../variables/Variables';

import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';

export default function GraphCard({title, thisClass}) {
  if (!title || !thisClass) {
    return (
      <div className="card card-graph">
        <h1>Select a Class</h1>
      </div>
    );
  }

  return (
    <div className="card card-graph">
      <Row className="content">
        <div className="graphTitle">{ title }</div>
      </Row>
      <Row>
        <Col sm={8}>
          <div className="graph">
            <BarChart width={600} height={245} data={thisClass.data}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />

            {thisClass.datakeys.map((item, index) => (
              <Bar dataKey={item} fill={vars.colors[index%vars.colors.length]}/>
            ))}

            </BarChart>
          </div>
        </Col>
        <Col sm={4}>
          <GradesInfoCard
              classNum={thisClass.classNum}
              semester={thisClass.semester}
              faculty={thisClass.faculty}
              title={thisClass.title}
              courseAvg={thisClass.courseAvg}
              sectionAvg={thisClass.sectionAvg}
              seventeenthName={thisClass.seventeenthName}
              seventeenthCount={thisClass.seventeenthCount}
              seventeenthGrade={thisClass.seventeenthGrade}
              seventeenthPercent={thisClass.seventeenthPercent}
            />
        </Col>
      </Row>
    </div>
  );
}
