import React, { Component } from 'react';
import axios from 'axios';

import ClassCardList from '../../components/ClassCards/ClassCardList';
import EnrollmentGraphCard from '../../components/GraphCard/EnrollmentGraphCard.jsx';
import EnrollmentInfoCard from '../../components/EnrollmentInfoCard/EnrollmentInfoCard.jsx';
import ClassSearchBar from '../../components/ClassSearchBar/ClassSearchBar.jsx';

import {
  vars,
  enrollment,
  optionsEnrollment,
  responsiveEnrollment
} from '../../variables/Variables';


class Enrollment extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      classCards: Enrollment.defaultProps.classCards,
      
      allSectionIDs: Enrollment.defaultProps.sectionIDs,

      newSectionIDs: Enrollment.defaultProps.sectionIDs,

      sectionData: {}
    }
    this.fetchGrades();
    this.removeClass = this.removeClass.bind(this)
  }

  removeClass(classNum) {
    this.setState((prevState, props) => ({
      classCards: prevState.classCards.filter(classInfo => classInfo.classNum !== classNum)
    }));
  }

  getCurrentDate() {
    var today = new Date();
    return today.toString().slice(4, 15);
  }
  
  async fetchGrades() {
    if (this.state.newSectionIDs && this.state.newSectionIDs.length > 0) {
      try {
        
        const sectionIDKey = this.state.newSectionIDs.join('&');

        const grades = await axios.get('http://localhost:8000/grades/sections/' + sectionIDKey + '/');

        // add metadata like semester & instructor name
        // get from course search bar
        var metadata = grades.data;
        var gradeName;
        if (metadata) {
          for (var i in vars.possibleGrades) {
            gradeName = vars.possibleGrades[i]
            metadata[gradeName]["grade_name"] = gradeName;  
          }
          metadata["section_id"] = sectionIDKey;
        }

        console.log(metadata);

        /* metadatas.map((metadata) =>
          if (metadata["grade_id"] == grades["course_id"]) {
            for (var key in metadata) {
              grades[key] = metadata[key];
            }
            break;
          } 
        );*/

        // just need newest ones
        this.setState({
           sectionData: metadata
         });
        
      } catch (error) {
        console.error(error)
      }
    }

  }
  render() {
    return (
      <div className="app-container">
        <ClassSearchBar />

        <ClassCardList
          classCards={this.state.classCards}
          removeClass={this.removeClass}
        />

        <EnrollmentGraphCard
          id="chartHours"
          title="Enrollment"
          classData={this.state.sectionData}
        />

      </div>
    );
  }
}

Enrollment.defaultProps = {
  courseID: '22993',
  sectionIDs: ['22993'],
  classCards: [
    {
      stripeColor:'#4EA6FB',
      classNum:"CS 61A",
      semester:"Spring 2018",
      faculty:"Denero",
      title:"The Structure and Interpretation of Computer Programs"
    }, {
      stripeColor:"#6AE086",
      classNum:"Math 1A",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"Single Variable Calculus"
    }, {
      stripeColor:"#ED5186",
      classNum:"English 43B",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"Introduction to the Art of Verse"
    }, {
      stripeColor:"#F9E152",
      classNum:"Art 18",
      semester:"Spring 2018",
      faculty:"n/a",
      title:"The Language of Painting"
    }
  ]
};

export default Enrollment;
