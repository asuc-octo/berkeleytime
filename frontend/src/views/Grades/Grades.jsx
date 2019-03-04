import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList.jsx';
import GraphCard from '../../components/GraphCard/GraphCard.jsx';
import GradesInfoCard from '../../components/GradesInfoCard/GradesInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

class Grades extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      classCards: Grades.defaultProps.classCards,

      //actual: last course user selected 
      //selectedCourseID: Grades.defaultProps.courseID, 

      // all section id displayed on screen so far
      allSectionIDs: Grades.defaultProps.sectionIDs,

      //newest section id [] selected by user; fetch data & update sectiondata
      newSectionIDs: Grades.defaultProps.sectionIDs,

      //only the newest grades fetched by user
      sectionData: {} //Grades.defaultProps.sectionData
    }

    this.fetchGrades();

    this.addClass = this.addClass.bind(this)
    this.removeClass = this.removeClass.bind(this)

  }

  addClass(classNum) {
    
  }

  removeClass(classNum) {
    this.setState((prevState, props) => ({
      classCards: prevState.classCards.filter(classInfo => classInfo.classNum !== classNum)
    }));

    this.setState({
      newSectionIDs: ["22993","25929","27994","30432","34596","42904","50262","39878","44969","48245","52725","36960","37412","53147","50821","50846","51536"]
    });
    this.fetchGrades();
  }

  async fetchGrades() {
    if (this.state.newSectionIDs && this.state.newSectionIDs.length > 0) {
      try {
        
        const sectionIDKey = this.state.newSectionIDs.join('&');

        const grades = await axios.get('http://localhost:8000/grades/sections/' + sectionIDKey + '/');

        console.log(sectionIDKey);
        // add metadata like semester & instructor name
        // get from course search bar
        // metadata = //response of course_grades
        /* metadatas.map((metadata) =>
          if (metadata["grade_id"] == grades["course_id"]) {
            for (var key in metadata) {
              grades[key] = metadata[key];
            }
            break;
          } 
        );*/

        // dont need all data
        // const newSectionData = this.state.sectionData;
        // newSectionData[sectionIDKey] = grades.data;

        // just need newest ones
        this.setState({
           sectionData: grades.data
         });
        
      } catch (error) {
        console.error(error)
      }
    }

  }

  getCurrentDate() {
    let today = new Date();
    return today.toString().slice(4, 15);
  }

  render() {
    return (
      <div className="app-container">
        <ClassSearchBar />

        <ClassCardList
          classCards={this.state.classCards}
          removeClass={this.removeClass}
        />

        <GraphCard
          id="chartHours"
          title="Grades"
          classData={this.state.sectionData}
        />

      </div>
    );
  }
}
Grades.defaultProps = {
  courseID: '31265',
  sectionIDs: ['31265'],
  sectionData: {
    "31265":
      {
        "A+": {
          "percentile_low": 0.89,
          "percent": 0.11,
          "percentile_high": 1,
          "numerator": 351
        },
        "A": {
            "percentile_low": 0.81,
            "percent": 0.08,
            "percentile_high": 0.89,
            "numerator": 258
        },
        "A-": {
            "percentile_low": 0.71,
            "percent": 0.09,
            "percentile_high": 0.81,
            "numerator": 291
        },
        "B+": {
            "percentile_low": 0.55,
            "percent": 0.17,
            "percentile_high": 0.71,
            "numerator": 527
        },
        "B": {
            "percentile_low": 0.38,
            "percent": 0.17,
            "percentile_high": 0.55,
            "numerator": 540
        },
        "B-": {
            "percentile_low": 0.24,
            "percent": 0.13,
            "percentile_high": 0.38,
            "numerator": 424
        },
        "C+": {
            "percentile_low": 0.2,
            "percent": 0.05,
            "percentile_high": 0.24,
            "numerator": 146
        },
        "C": {
            "percentile_low": 0.15,
            "percent": 0.04,
            "percentile_high": 0.2,
            "numerator": 133
        },
        "C-": {
            "percentile_low": 0.12,
            "percent": 0.04,
            "percentile_high": 0.15,
            "numerator": 120
        },
        "D": {
            "percentile_low": 0.04,
            "percent": 0.07,
            "percentile_high": 0.12,
            "numerator": 224
        },
        "F": {
            "percentile_low": 0,
            "percent": 0.04,
            "percentile_high": 0.04,
            "numerator": 139
        },
          "course_id": 2321,
          "course_gpa": 2.841,
          "course_letter": "B-",
          "section_letter": "B-",
          "section_gpa": 2.841,
          "denominator": 3153,
          "title": "COMPSCI 61A",
          "subtitle": "The Structure and Interpretation of Computer Programs",
      }
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
