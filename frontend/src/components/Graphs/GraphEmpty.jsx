import React from 'react';
// import emptyImage from '../../assets/img/images/empty-graph.png';
import emptyImage from '../../assets/img/images/empty-sign.jpg';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import vars from '../../variables/Variables';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';
import { Container, Row, Col } from 'react-bootstrap';




class GraphEmpty extends React.PureComponent {
  render() {
    const { pageType } = this.props;
    const gradesData = [{}];
    const graphData_grade = [{name: "A+"}, {name: "A"}, {name: "A-"}, {name: "B+"},
    {name: "B"}, {name: "B-"}, {name: "C+"}, {name: "C"}, {name: "C-"}, {name: "D"},
    {name: "F"}, {name: "P"}, {name: "NP"}];

    const graphData_enroll = [{name: "0"}, {name: "20"}, {name: "40"}, {name: "60"},
    {name: "80"}, {name: "100"}, {name: "120"}, {name: "140"}, {name: "160"}, {name: "180"}]

    return (
      <div className="graph-empty">
      <Container fluid>
        <Row>
          <Col lg={8}>
            <ResponsiveContainer width="100%" height={500}>
            <BarChart data={pageType == "enrollment" ? graphData_enroll : graphData_grade}>
              <XAxis dataKey="name" />
              <YAxis type="number" unit="%" domain={[0, 100]}/>
              <Tooltip
                cursor={{fill: '#fff'}}
                formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]}
              />
              {gradesData.map((item, i) => (
                <Bar
                  name={`${item.title} / ${item.semester} / ${item.instructor}`}
                  dataKey={item.id}
                  fill={vars.colors[item.colorId]}
                />
              ))}
            </BarChart>
            </ResponsiveContainer>
          </Col>

          <Col lg={4}>
            <div className="grades-info">
              <div className="header">
                <div className="square" />
                <div className="course">No Class Selected</div>
              </div>
              <div className="title">No Class Name Data</div>
              <div className="info">No Semester or Instructor Data</div>
              {pageType == "enrollment" ? null :
                <div>
                <h6>Course Average</h6>
                <div className="course-average">
                  <span>No Data</span>
                </div>
                <h6>Section Average</h6>
                <div className="section-average">
                  <span>No Data</span>
                </div>
                </div>
              }

            </div>
          </Col>
        </Row>

      </Container>

        <div className="graph-empty-content">
          <img className="graph-empty-image" src={emptyImage} alt="empty state" />
          <h3 className="graph-empty-heading" align="center">
            You have not added any <br /> classes yet.
          </h3>
        </div>

      </div>
    );
  }
}

export default GraphEmpty;
