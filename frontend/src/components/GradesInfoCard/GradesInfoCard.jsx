import React, { PureComponent } from 'react';
import ReactTooltip from "react-tooltip";


import {
  percentileToString,
  getGradeColor
} from '../../utils/utils';
import info from '../../assets/img/images/graphs/info.svg';

class GradesInfoCard extends PureComponent {


  render() {
    const {
      course, subtitle, semester, instructor,
      courseLetter, courseGPA, sectionLetter,
      sectionGPA, selectedPercentiles, selectedGrade,
      denominator, betterGrade, worseGrade, color
    } = this.props;


    var courseAvgText = '<span class="info-text"}>Course average refers to the average of all <br />sections available across all instructors.</span>';
    var sectionAvgText = '<span class="info-text"}>Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';

    return (
      <div className="grades-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <div className="course">{ course }</div>
        </div>
        <div className="title">{ subtitle }</div>
        <div className="info">{ `${semester} • ${instructor}` }</div>
        <h6>Course Average
          <span data-tip={courseAvgText} data-for="courseAvg">
            <img src={info} className="info-icon"/>
          </span>
          <ReactTooltip id='courseAvg' type='light' html={true} border={true} borderColor="#C4C4C4"
              arrowColor="#FFFFFF"/>
        </h6>
        <div className="course-average">
          <span className={getGradeColor(courseLetter)}>{ courseLetter }</span>
          ({ courseGPA })
        </div>
        <h6>Section Average
          <span data-tip={sectionAvgText} data-for="sectionAvg">
            <img src={info} className="info-icon"/>
          </span>
          <ReactTooltip id='sectionAvg' type='light' html={true} border={true} borderColor="#C4C4C4"
              arrowColor="#FFFFFF"/>
        </h6>
        <div className="section-average">
          <span className={getGradeColor(sectionLetter)}>{ sectionLetter }</span>
          ({ sectionGPA })
        </div>
        {selectedGrade !== undefined && selectedGrade !== null && selectedPercentiles !== undefined && selectedPercentiles !== null && (
          <div>
            <h6>
              {`${percentileToString(selectedPercentiles.percentile_low)}-${percentileToString(selectedPercentiles.percentile_high)} Percentile`}
              <span data-tip={courseAvgText} data-for="courseAvg">
                <img src={info} className="info-icon"/>
              </span>
              <ReactTooltip id='courseAvg' type='light' html={true} border={true} borderColor="#C4C4C4"
                  arrowColor="#FFFFFF"/>
            </h6>
            <div className="percentile">
              <span className={getGradeColor(selectedGrade)}>{ selectedGrade }</span>
            </div>
            <div className="number">
              <h6>{selectedPercentiles.numerator}/{denominator}</h6>
              <div>
                <span>{Math.round(selectedPercentiles.numerator/denominator * 1000) / 10}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default GradesInfoCard;
