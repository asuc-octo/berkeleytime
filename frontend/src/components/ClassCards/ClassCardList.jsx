import React, { PureComponent } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import ClassCard from './ClassCard';
import ClassCardMobile from './ClassCardMobile';
import vars from '../../variables/Variables';

class ClassCardList extends PureComponent {
  render() {
    const { selectedCourses, removeCourse, isMobile } = this.props

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


export default ClassCardList;