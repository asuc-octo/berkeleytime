import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import ClassCard from './ClassCard';
import ClassCardMobile from './ClassCardMobile';
import vars from '../../variables/Variables';

import { connect } from 'react-redux';
import { fetchGradeData } from '../../redux/actions';

class ClassCardList extends Component {
  
  getAvg(){
    const { selectedCourses, fetchGradeData } = this.props;
    fetchGradeData(selectedCourses);
    console.log(gradesData);
  }

  render() {
    const { selectedCourses, removeCourse, isMobile } = this.props

    this.getAvg();

    return (
      <Container fluid className="class-card-list">
        <Row>
          {
            selectedCourses.map((item, i) => (
              <ClassCard
                id={item.id}
                course={item.course}
                title={item.title}
                fill={vars.colors[item.colorId]}
                semester={item.semester === 'all' ? 'All Semesters' : item.semester}
                faculty={item.instructor === 'all' ? 'All Instructors' : item.instructor}
                removeCourse={removeCourse}
                colorId={item.colorId}
              /> 
            ))
          }
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  fetchGradeData: (selectedCourses) => dispatch(fetchGradeData(selectedCourses)),
});

const mapStateToProps = state => {
  const { gradesData } = state.grade;
  return {
    gradesData
  };
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClassCardList);