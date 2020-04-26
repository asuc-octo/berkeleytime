import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';

import { connect } from 'react-redux';
import vars from '../../variables/Variables';

import EnrollmentGraph from '../Graphs/EnrollmentGraph.jsx';
import GraphEmpty from '../Graphs/GraphEmpty.jsx';
import EnrollmentInfoCard from '../EnrollmentInfoCard/EnrollmentInfoCard.jsx';

import { fetchEnrollData } from '../../redux/actions';

class EnrollmentGraphCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredClass: false,
    };

    this.updateLineHover = this.updateLineHover.bind(this);
    this.updateGraphHover = this.updateGraphHover.bind(this);
  }

  componentDidMount() {
    this.getEnrollmentData();
  }

  componentDidUpdate(prevProps) {
    const { selectedCourses, enrollmentData } = this.props;
    if (selectedCourses !== prevProps.selectedCourses) {
      this.getEnrollmentData();
    }
    if (enrollmentData !== prevProps.enrollmentData && enrollmentData.length > 0 && selectedCourses.length === 1) {
      this.update(selectedCourses[0], 0)
    }

    const latest_point = enrollmentData.map((course) => course.data[course.data.length - 1]);
    const telebears = enrollmentData.map((course) => course.telebears);
    const enrolled_info = latest_point.map((course) => [course.enrolled, course.enrolled_max, course.enrolled_percent]);
    const waitlisted_info = latest_point.map((course) => [course.waitlisted, course.waitlisted_max, course.waitlisted_percent]);

    this.props.updateClassCardEnrollment(latest_point, telebears, enrolled_info, waitlisted_info);
  }

  getEnrollmentData() {
    const { selectedCourses, fetchEnrollData } = this.props;
    fetchEnrollData(selectedCourses);
  }

  // buildGraphData(enrollmentData) {
  //   let days = [...Array(200).keys()]
  //   const graphData = days.map(day => {
  //     let ret = {
  //       name: day,
  //     };
  //
  //     for(let enrollment of enrollmentData) {
  //       let validTimes = enrollment.data.filter(time => time.day >= 0);
  //       let enrollmentTimes = {};
  //       for(let validTime of validTimes) {
  //         enrollmentTimes[validTime.day] = validTime;
  //       }
  //
  //       if(day in enrollmentTimes) {
  //         ret[enrollment.id] = (enrollmentTimes[day].enrolled_percent * 100).toFixed(1);
  //       }
  //     }
  //
  //     return ret;
  //   });
  //
  //   return graphData;
  // }


  update(course, day) {
    const { enrollmentData } = this.props;
    const selectedEnrollment = enrollmentData.filter(c => course.id === c.id)[0];

    const valid = selectedEnrollment && selectedEnrollment.data.filter(d => d.day === day).length;
    if (valid) {
      const hoverTotal = {
        ...course,
        ...selectedEnrollment,
        hoverDay: day,
      };

      this.setState({
        hoveredClass: hoverTotal,
      });
    }
  }

  // Handler function for updating EnrollmentInfoCard on hover
  updateLineHover(lineData) {
    const { selectedCourses } = this.props;
    const selectedClassID = lineData.dataKey;
    const day = lineData.index;
    const selectedCourse = selectedCourses.filter(course => selectedClassID === course.id)[0];
    this.update(selectedCourse, day);
  }

  // Handler function for updating EnrollmentInfoCard on hover with single course
  updateGraphHover(data) {
    const { isTooltipActive, activeLabel } = data;
    const { selectedCourses } = this.props;

    if (isTooltipActive && selectedCourses.length === 1) {
      const selectedCourse = selectedCourses[0];
      const day = activeLabel;
      this.update(selectedCourse, day);
    }
  }

  render() {
    const { hoveredClass } = this.state;
    const { graphData, enrollmentData, selectedCourses, isMobile } = this.props;
    const telebears = enrollmentData.length ? enrollmentData[0].telebears : {};
    const graphEmpty = enrollmentData.length === 0 || selectedCourses.length === 0;

    let selectedPoint= hoveredClass && hoveredClass.data.filter(pt => pt.day === hoveredClass.hoverDay)[0]

    let period = '';
    let daysAfterPeriodStarts = 0;
    if (selectedPoint.day < telebears.phase2_start_day) {
      period = 'Phase I';
      daysAfterPeriodStarts = selectedPoint.day - telebears.phase1_start_day;
    } else if (selectedPoint.day < telebears.adj_start_day) {
      period = 'Phase II';
      daysAfterPeriodStarts = selectedPoint.day - telebears.phase2_start_day;
    } else {
      period = 'Adjustment Period';
      daysAfterPeriodStarts = selectedPoint.day - telebears.adj_start_day;
    }

    return (

        <div className="enrollment-graph">
              <div className="enrollment-content">
                <Row>
                  <Col xs={{span: 12, order:2}} sm={{span: 12, order:2}} md={{span: 8, order:1}}  lg={{span: 8, order:1}}>
                    {isMobile && 
                      (<div className="enrollment-mobile-heading"> Enrollment </div>)
                    }
                    <EnrollmentGraph
                      graphData={graphData}
                      enrollmentData={enrollmentData}
                      updateLineHover={this.updateLineHover}
                      updateGraphHover={this.updateGraphHover}
                      graphEmpty={graphEmpty}
                      isMobile={isMobile}
                    />
                  </Col>

                  { graphEmpty && 
                    <Col xs={{span: 12, order:1}} sm={{span: 12, order:1}} md={{span: 4, order:2}} lg={{span: 4, order:2}}>
                      <GraphEmpty pageType="enrollment" />
                    </Col>
                  }

                  { !isMobile && !graphEmpty &&
                    <Col md={{span: 4, order:2}} lg={{span: 4, order:2}}>
                      {hoveredClass && (
                        <EnrollmentInfoCard
                          title={hoveredClass.title}
                          subtitle={hoveredClass.subtitle}
                          semester={hoveredClass.semester}
                          instructor={hoveredClass.instructor === 'all' ? 'All Instructors' : hoveredClass.instructor}
                          selectedPoint={hoveredClass.data.filter(pt => pt.day === hoveredClass.hoverDay)[0]}
                          todayPoint={hoveredClass.data[hoveredClass.data.length - 1]}
                          telebears={telebears}
                          color={vars.colors[hoveredClass.colorId]}
                          enrolledMax={hoveredClass.enrolled_max}
                          waitlistedMax={hoveredClass.waitlisted_max}
                        />
                      )}
                    </Col> 
                  }
                </Row> 
              </div>
        </div>
    );
  }
}


const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchEnrollData: (selectedCourses) => dispatch(fetchEnrollData(selectedCourses)),
});

const mapStateToProps = state => {
  const { enrollmentData, graphData, selectedCourses } = state.enrollment;
  return {
    enrollmentData,
    graphData,
    selectedCourses
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnrollmentGraphCard);
