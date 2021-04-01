import React, { PureComponent } from 'react';
import ReactTooltip from "react-tooltip";

import { H5, H6, P } from 'bt/custom';


import {
  percentileToString,
  getGradeColor,
} from '../../utils/utils';
import info from '../../assets/img/images/graphs/info.svg';

class GradesInfoCard extends PureComponent {


  render() {
    const {
      course, subtitle, semester, instructor,
      courseLetter, courseGPA, sectionLetter,
      sectionGPA, selectedPercentiles, selectedGrade,
      denominator, color
    } = this.props;


    var courseAvgText = '<span class="info-text"}>Course average refers to the average of all <br />sections available across all instructors.</span>';
    var sectionAvgText = '<span class="info-text"}>Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';
    var percentileText = '<span class="info-text"}>Detailed information about the percentile range of students <br />who received the corresponding grade, along with the exact number<br /> and percent of students out of the total.</span>';

    return (
      <div className="grades-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <H5 bold className="course">{ course }</H5>
        </div>
        <P className="title">{ subtitle }</P>
        <P className="info">{ `${semester} • ${instructor}` }</P>
        <H6 bold>Course Average
          <span data-tip={courseAvgText} data-for="courseAvg">
            <img src={info} className="info-icon" alt="" />
          </span>
          <ReactTooltip id='courseAvg' type='light' html={true} border={true} borderColor="#C4C4C4" className="opaque"
              arrowColor="#FFFFFF"/>
        </H6>
        <div className="course-average">
          <span className={courseLetter ? getGradeColor(courseLetter) : ""}>{ courseLetter }</span>
          <span className="count">{ courseGPA !== -1 ? '(' + courseGPA + ')' : null }</span>
        </div>
        <H6 bold>Section Average
          <span data-tip={sectionAvgText} data-for="sectionAvg">
            <img src={info} className="info-icon" alt="" />
          </span>
          <ReactTooltip id='sectionAvg' type='light' html={true} border={true} borderColor="#C4C4C4" className="opaque"
              arrowColor="#FFFFFF"/>
        </H6>
        <div className="section-average">
          <span className={sectionLetter ? getGradeColor(sectionLetter) : ""}>{ sectionLetter }</span>
          <span className="count">{ sectionGPA !== -1 ? '(' + sectionGPA + ')' : null }</span>
        </div>
        {selectedGrade !== undefined && selectedGrade !== null && selectedPercentiles !== undefined && selectedPercentiles !== null && (
          <div>
            <H6 bold>
              {`${percentileToString(selectedPercentiles.percentile_low)}-${percentileToString(selectedPercentiles.percentile_high)} Percentile`}
              <span data-tip={percentileText} data-for="percentileInfo">
                <img src={info} className="info-icon" alt="" />
              </span>
              <ReactTooltip id='percentileInfo' type='light' html={true} border={true} borderColor="#C4C4C4" className="opaque"
                  arrowColor="#FFFFFF"/>
            </H6>
              <span className={selectedGrade ? getGradeColor(selectedGrade) : ""}>{ selectedGrade }</span>
              <span className="count">({selectedPercentiles.numerator}/{denominator}, {Math.round(selectedPercentiles.numerator/denominator * 1000) / 10}%)</span>
          </div>
        )}
      </div>
    );
  }
}

export default GradesInfoCard;
