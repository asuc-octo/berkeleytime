import React from 'react';
// import emptyImage from '../../assets/img/images/empty-graph.png';
import emptyImage from '../../assets/img/images/empty-sign.png';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import vars from '../../variables/Variables';
import GradesInfoCard from '../GradesInfoCard/GradesInfoCard';
import { Container, Row, Col } from 'react-bootstrap';

const EmptyLabel = props => {
      return (
        <div className="graph-empty-content">
          <img className="graph-empty-image" src={emptyImage} alt="empty state" />
          <h3 className="graph-empty-heading" align="center">
          You have not added any <br /> classes yet.
          </h3>
      </div>
      );
    };

class GraphEmpty extends React.PureComponent {

  render() {
    const { pageType } = this.props;
    const gradesData = [{}];
    const graphData_grade = [{name: "A+"}, {name: "A"}, {name: "A-"}, {name: "B+"},
    {name: "B"}, {name: "B-"}, {name: "C+"}, {name: "C"}, {name: "C-"}, {name: "D"},
    {name: "F"}, {name: "P"}, {name: "NP"}];

    const graphData_enroll = [{name: "0"}, {name: "20"}, {name: "40"}, {name: "60"},
    {name: "80"}, {name: "100"}, {name: "120"}, {name: "140"}, {name: "160"}, {name: "180"}]

    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('en-US', dateOptions);

    return (
      <div className="graph-empty">
      <Container fluid>
        <Row>
          <Col xs={{span:12, order:2}} s={{span:12, order:2}} md={{order:1}} lg={{span:8, order:1}}>
            <ResponsiveContainer width="90%" height={440}>
            <BarChart data={pageType == "enrollment" ? graphData_enroll : graphData_grade}>
              <Label position="center" />
              <XAxis dataKey="name" />
              <YAxis type="number" unit="%" domain={[0, 100]}/>
              <Tooltip
                cursor={{fill: '#fff'}}
                content={<EmptyLabel />}
                position={{ x: 50, y: 150 }}
                wrapperStyle={{visibility: 'visible'}}
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

          <Col xs={{span:12, order:1}} s={{span:12, order:1}} md={{order:2}} lg={{span:4, order:2}}>
            <div className="grades-info">
              <div className="header">
                <div className="square" />
                <div className="course">No Class Selected</div>
              </div>
              <div className="title">No Class Name Data</div>
              <div className="info">No Semester or Instructor Data</div>
              {pageType == "enrollment" ?
                null :
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
    </div>
    );
  }
}

export default GraphEmpty;
