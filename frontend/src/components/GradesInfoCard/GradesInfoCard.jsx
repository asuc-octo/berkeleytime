import React, { PureComponent } from "react";
import ReactTooltip from "react-tooltip";

import { percentileToString, getGradeColor } from "../../utils/utils";
import info from "../../assets/img/images/graphs/info.svg";

class GradesInfoCard extends PureComponent {
  render() {
    const {
      course,
      subtitle,
      semester,
      instructor,
      courseLetter,
      courseGPA,
      sectionLetter,
      sectionGPA,
      selectedPercentiles,
      selectedGrade,
      denominator,
      betterGrade,
      worseGrade,
      color,
    } = this.props;

    var courseAvgText =
      '<span class="info-text"}>Course average refers to the average of all <br />sections available across all instructors.</span>';
    var sectionAvgText =
      '<span class="info-text"}>Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';
    var percentileText =
      '<span class="info-text"}>Detailed information about the percentile range of students <br />who received the corresponding grade, along with the exact number<br /> and percent of students out of the total.</span>';

    return (
      <div className="grades-info">
        <div className="header">
          <div className="square" style={{ backgroundColor: color }} />
          <div className="course">{course}</div>
        </div>
        <div className="title">{subtitle}</div>
        <div className="info">{`${semester} • ${instructor}`}</div>
        <h6>
          Course Average
          <span data-tip={courseAvgText} data-for="courseAvg">
            <img src={info} className="info-icon" />
          </span>
          <ReactTooltip
            id="courseAvg"
            type="light"
            html={true}
            border={true}
            borderColor="#C4C4C4"
            className="opaque"
            arrowColor="#FFFFFF"
          />
        </h6>
        <div className="course-average">
          <span className={courseLetter ? getGradeColor("A+") : ""}>A+</span>
          {courseGPA !== -1 ? "(4.000)" : null}
        </div>
        <h6>
          Section Average
          <span data-tip={sectionAvgText} data-for="sectionAvg">
            <img src={info} className="info-icon" />
          </span>
          <ReactTooltip
            id="sectionAvg"
            type="light"
            html={true}
            border={true}
            borderColor="#C4C4C4"
            className="opaque"
            arrowColor="#FFFFFF"
          />
        </h6>
        <div className="section-average">
          <span className={sectionLetter ? getGradeColor("A+") : ""}>A+</span>
          {sectionGPA !== -1 ? "(4.000)" : null}
        </div>
        {selectedGrade !== undefined &&
          selectedGrade !== null &&
          selectedPercentiles !== undefined &&
          selectedPercentiles !== null && (
            <div>
              <h6>
                {`${percentileToString(
                  selectedPercentiles.percentile_low
                )}-${percentileToString(
                  selectedPercentiles.percentile_high
                )} Percentile`}
                <span data-tip={percentileText} data-for="percentileInfo">
                  <img src={info} className="info-icon" />
                </span>
                <ReactTooltip
                  id="percentileInfo"
                  type="light"
                  html={true}
                  border={true}
                  borderColor="#C4C4C4"
                  className="opaque"
                  arrowColor="#FFFFFF"
                />
              </h6>
              <span
                className={selectedGrade ? getGradeColor(selectedGrade) : ""}
              >
                {selectedGrade}
              </span>
              ({selectedGrade == "A+" ? `${denominator}/${denominator}` : "0/0"}{" "}
              {selectedGrade == "A+"
                ? Math.round((denominator / denominator) * 1000) / 10
                : 0}
              %)
            </div>
          )}
      </div>
    );
  }
}

export default GradesInfoCard;
