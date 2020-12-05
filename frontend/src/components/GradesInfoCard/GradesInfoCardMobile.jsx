import React, { PureComponent } from 'react';
import GradesInfoCard from './GradesInfoCard';
import vars from '../../variables/Variables';

class GradesInfoCardMobile extends PureComponent {

	checkNullState(item){
		return item ? item : " ";
	}

    render() {
		const {
      		course, subtitle, semester, instructor,
      		courseLetter, courseGPA, sectionLetter,
      		sectionGPA, selectedPercentiles, selectedGrade,
      		denominator, betterGrade, worseGrade, color,
    	} = this.props;

    	return (
    		<GradesInfoCard
            	course={this.checkNullState(course ? course : "NO CLASS ADDED")}
            	subtitle={this.checkNullState(subtitle)}
            	semester={this.checkNullState(semester === 'all' ? 'All Semesters' : semester)}
            	instructor={this.checkNullState(instructor === 'all' ? 'All Instructors' : 	instructor)}
            	courseLetter={this.checkNullState(courseLetter)}
            	courseGPA={this.checkNullState(courseGPA)}
            	sectionLetter={this.checkNullState(sectionLetter)}
            	sectionGPA={this.checkNullState(sectionGPA)}
            	denominator={this.checkNullState(denominator)}
            	selectedPercentiles={this.checkNullState(betterGrade)}
            	selectedGrade={this.checkNullState(worseGrade)}
            	color={this.checkNullState(color)}
        	/>
    	)              
  	}
}

export default GradesInfoCardMobile;
