import React from 'react';
import ReactTooltip from "react-tooltip";

import emptyImage from '../../assets/img/images/graphs/empty.svg';
import info from '../../assets/img/images/graphs/info.svg';

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

    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayString = today.toLocaleDateString('en-US', dateOptions);

    var courseAvgText = '<span class="info-text"}>Course average refers to the average of all <br />sections available across all instructors.</span>';
    var sectionAvgText = '<span class="info-text"}>Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';

    return (
      <div className="graph-empty">
      <Container fluid>
        <Row>
          <Col lg={8}>
            <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pageType == "enrollment" ? graphData_enroll : graphData_grade} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <XAxis dataKey="name" />
              <YAxis type="number" unit="%" domain={[0, 100]}/>
              <Tooltip
                cursor={{fill: '#fff'}}
                formatter={(value, name) => [`${Math.round(value * 10) / 10}%`, name]}
              />
              {gradesData.map((item, i) => (
                <Bar />
              ))}
            </BarChart>
            </ResponsiveContainer>
            
            <div className="graph-empty-content">
              <img className="graph-empty-image" src={emptyImage} alt="empty state" />
              <h3 className="graph-empty-heading" align="center">
                You have not added any <br /> classes yet.
              </h3>
            </div>
          </Col>

          <Col lg={4}>
            <div className="grades-info">
              <div className="header">
                <div className="square" />
                <div className="course">No Class Selected</div>
              </div>
              <div className="title">No Class Name Data</div>
              <div className="info">No Semester or Instructor Data</div>
              {pageType === "enrollment" ?
                null :
                <div>
                <h6>Course Average
                  <span data-tip={courseAvgText} data-for="courseAvg">
                    <img src={info} className="info-icon"/>
                  </span>
                  <ReactTooltip id='courseAvg' type='light' html={true} border={true} borderColor="#C4C4C4"
                      arrowColor="#FFFFFF"/>
                </h6>
                <div className="course-average">
                  <span>No Data</span>
                </div>
                <h6>Section Average
                  <span data-tip={sectionAvgText} data-for="sectionAvg">
                    <img src={info} className="info-icon"/>
                  </span>
                  <ReactTooltip id='sectionAvg' type='light' html={true} border={true} borderColor="#C4C4C4"
                      arrowColor="#FFFFFF"/>
                </h6>
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
