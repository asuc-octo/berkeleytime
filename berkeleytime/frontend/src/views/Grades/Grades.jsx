import React, { Component } from 'react';
import axios from 'axios';

// import { Card } from '../../components/Card/Card.jsx';
import ClassCard from '../../components/ClassCard/ClassCard.jsx';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

import {
  grades,
} from '../../variables/Variables';

class Grades extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      classCards: Grades.defaultProps.classCards,
      selectedClass: Grades.defaultProps.selectedClass
    }
    this.fetchClassInfo();

    this.addClass = this.addClass.bind(this)
    this.removeClass = this.removeClass.bind(this)

  }

  addClass(classNum) {
    // add class card
    // fetch class info
  }

  removeClass(classNum) {
    this.setState({ 
      classCards: this.state.classCards.filter(
        classInfo => classInfo.classNum != classNum) 
    })
  }

  // fetch class info
  async fetchClassInfo() { 
    try {
      this.info = await axios.get('http://localhost:8000/grades/course_grades/1062/')
      console.log(this.info.data)
    } catch (error) {
      console.error(error)
    }
  }

  getCurrentDate() {
    let today = new Date();
    return today.toString().slice(4, 15);
  }

  render() {
    //const { classCards } = this.state.classCards;


    return (
      <div className="app-container">
        <ClassSearchBar />

        <div className="columns">
          {this.state.classCards.map(item => (
            <div className="column card-column">
              <ClassCard
                stripeColor={item.stripeColor}
                classNum={item.classNum}
                semester={item.semester}
                faculty={item.faculty}
                title={item.title}
                removeClass={this.removeClass}
              />
            </div>
          ))}
        </div>

        <GraphCard
          id="chartHours"
          title="Enrollment"
          thisClass={this.state.selectedClass}
        />

      </div>
    );
  }
}
Grades.defaultProps = {
  selectedClass: {
    semester: "Spring 2018",
    data: grades,
    datakeys: ['classA', 'classB'],
    classNum: "CS 61A",
    semester: "Spring 2018",
    faculty: "Denero",
    title: "The Structure and Interpretation of Computer Programs",
    courseAvg: "A- (GPA: 3.72)",
    sectionAvg: "A- (GPA: 3.72)",
    seventeenthName: "17th-18th",
    seventeenthCount: "15/3103",
    seventeenthGrade: "C+",
    seventeenthPercent: "0"
  }, 
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
  ]
};

export default Grades;
