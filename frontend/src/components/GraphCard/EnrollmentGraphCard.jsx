import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axios from 'axios';

import EnrollmentGraph from '../Graphs/EnrollmentGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';

class EnrollmentGraphCard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      enrollmentData: [],
      graphData: [],
      hoveredClass: false,
    },

    this.updateInfoCard = this.updateInfoCard.bind(this);
  }

  componentDidMount() {
    this.getEnrollmentData();
  }

  componentDidUpdate(prevProps) {
    const { classData } = this.props;
    if (classData !== prevProps.classData) {
      this.getEnrollmentData();
    }
  }

  getEnrollmentData() {
    const { classData } = this.props;
    let promises = [];

    for(let course of classData) {
      let { instructor, courseID, semester, sections } = course;

      let url;
      if(instructor === 'all') {
        let [sem, year] = semester.split(' ');
        url = `/api/enrollment/aggregate/${courseID}/${sem.toLowerCase()}/${year}/`;
      } else {
        url = `/api/enrollment/data/${sections[0]}/`;
      }

      promises.push(axios.get(url));
    }

    axios.all(promises).then(data => {
      let enrollmentData = data.map((res, i) => {
        let enrollmentData = res.data;
        enrollmentData['id'] = classData[i].id;
        return enrollmentData
      })

      this.setState({
        enrollmentData: enrollmentData,
        graphData: this.buildGraphData(enrollmentData),
      })
    })
  }

  buildGraphData(enrollmentData) {
    let days = [...Array(200).keys()]
    const graphData = days.map(day => {
      let ret = {
        name: day,
      };

      for(let enrollment of enrollmentData) {
        let validTimes = enrollment.data.filter(time => time.day >= 0);
        let enrollmentTimes = {};
        for(let validTime of validTimes) {
          enrollmentTimes[validTime.day] = validTime;
        }

        if(day in enrollmentTimes) {
          ret[enrollment.id] = (enrollmentTimes[day].enrolled_percent * 100).toFixed(1);
        }
      }

      return ret;
    });

    return graphData;
  }

  // Handler function for updating EnrollmentInfoCard on hover
  updateInfoCard(lineData) {
    const { enrollmentData } = this.state;
    const { classData } = this.props;

    const selectedClassID = lineData.dataKey;

    let selectedCourse = classData.filter(course => selectedClassID == course.id)[0]
    let selectedEnrollment= enrollmentData.filter(course => selectedClassID == course.id)[0]

    let hoverTotal = {
      ...selectedCourse,
      ...selectedEnrollment,
      hoverDay: lineData.index,
    }

    this.setState({
      hoveredClass: hoverTotal,
    })
  }

  render () {
    let { graphData, enrollmentData, hoveredClass } = this.state;
    let telebears = enrollmentData.length ? enrollmentData[0]['telebears'] : {};

    return (
      <div className="card enrollment-graph-card">
        <div className="enrollment-graph">
          {
            enrollmentData.length === 0 ? (
              <GraphEmpty pageType='enrollment'/>
            ) : (
              <div className="enrollment-content">
                <Row>
                  <div className="graph-title">{ this.props.title }</div>
                </Row>
                <Row>
                  <Col sm={8}>
                    <EnrollmentGraph
                      graphData={graphData}
                      enrollmentData={enrollmentData}
                      updateInfoCard={this.updateInfoCard}
                    />
                  </Col>

                  <Col sm={4}>
                    {hoveredClass &&
                      <EnrollmentInfoCard
                        title={hoveredClass.title}
                        subtitle={hoveredClass.subtitle}
                        semester={hoveredClass.semester}
                        instructor={hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor}
                        selectedPoint={hoveredClass.data.filter(pt => pt.day === hoveredClass.hoverDay)[0]}
                        todayPoint={hoveredClass.data[hoveredClass.data.length-1]}
                        telebears={telebears}
                      />
                    }
                  </Col>
                </Row>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default EnrollmentGraphCard;