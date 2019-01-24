import React, { Component } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// import { Card } from '../../components/Card/Card.jsx';
import ClassCard from '../../components/ClassCard/ClassCard.jsx';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';

import {
  grades,
} from '../../variables/Variables';

class Grades extends Component {
  getCurrentDate() {
    let today = new Date();
    return today.toString().slice(4, 15);
  }

  render() {
    const { classCards } = this.props;
    return (
      <div className="app-container">
        <div className="columns">
          {classCards.map(item => (
            <div className="column">
              <ClassCard
                stripeColor={item.stripeColor}
                classNum={item.classNum}
                semester={item.semester}
                faculty={item.faculty}
                title={item.title}
              />
            </div>
          ))}
        </div>
        <GraphCard
          id="chartHours"
          title="Enrollment"
          semester="Spring 2018"
          graph={(
            <BarChart width={600} height={245} data={grades}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Bar dataKey="classA" fill="#579EFF" />
              <Bar dataKey="classB" fill="#FFFF00" />
            </BarChart>
          )}
          info={(
            <GradesInfoCard
              classNum="CS 61A"
              semester="Spring 2018"
              faculty="Denero"
              title="The Structure and Interpretation of Computer Programs"
              courseAvg="A- (GPA: 3.72)"
              sectionAvg="A- (GPA: 3.72)"
              seventeenthName="17th-18th"
              seventeenthCount="15/3103"
              seventeenthGrade="C+"
              seventeenthPercent="0"
            />
          )}
        />
      </div>
    );
  }
}
Grades.defaultProps = {
  classCards: [
    {
      stripeColor: '#4EA6FB',
      classNum: 'CS 61A',
      semester: 'Spring 2018',
      faculty: 'Denero',
      title: 'The Structure and Interpretation of Computer Programs',
    }, {
      stripeColor: '#6AE086',
      classNum: 'Math 1A',
      semester: 'Spring 2018',
      faculty: 'n/a',
      title: 'Single Variable Calculus',
    }, {
      stripeColor: '#ED5186',
      classNum: 'English 43B',
      semester: 'Spring 2018',
      faculty: 'n/a',
      title: 'Introduction to the Art of Verse',
    }, {
      stripeColor: '#F9E152',
      classNum: 'Art 18',
      semester: 'Spring 2018',
      faculty: 'n/a',
      title: 'The Language of Painting',
    },
  ],
};

export default Grades;
