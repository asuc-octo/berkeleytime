import React from 'react';
import ReactTooltip from "react-tooltip";

import info from '../../assets/img/images/graphs/info.svg';

class GraphEmpty extends React.PureComponent {

  render() {
    const { pageType } = this.props;
    var courseAvgText = '<span class="info-text"}>Course average refers to the average of all <br />sections available across all instructors.</span>';
    var sectionAvgText = '<span class="info-text"}>Section average refers to the average of all sections that <br />have been filtered for using the specified options.</span>';

    return (
      <div className="graph-empty">
            <div className="grades-info">
              <div className="header">
                <div className="square" />
                <div className="course">No Class Selected</div>
              </div>
              <div className="title">No Class Name Data</div>
              <div className="info">No Semester or Instructor Data</div>
              {pageType === "enrollment" ?
                null :
                <div>
                <div className="bt-h6">Course Average
                  <span data-tip={courseAvgText} data-for="courseAvg">
                    <img src={info} className="info-icon" alt="" />
                  </span>
                  <ReactTooltip id='courseAvg' type='light' html={true} border={true} borderColor="#C4C4C4" className="opaque"
                      arrowColor="#FFFFFF"/>
                </div>
                <div className="course-average">
                  <span className="bt-h6">No Data</span>
                </div>
                <div className="bt-h6">Section Average
                  <span data-tip={sectionAvgText} data-for="sectionAvg">
                    <img src={info} className="info-icon" alt="" />
                  </span>
                  <ReactTooltip id='sectionAvg' type='light' html={true} border={true} borderColor="#C4C4C4" className="opaque"
                      arrowColor="#FFFFFF"/>
                </div>
                <div className="section-average">
                  <span className="bt-h6">No Data</span>
                </div>
                </div>
              }

            </div>
    </div>
    );
  }
}

export default GraphEmpty;
