import React from 'react';

class GraphEmpty extends React.PureComponent {
  
  render() {
    const { pageType } = this.props;

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
                <h6>Course Average</h6>
                <div className="course-average">
                  <span>No Data</span>
                </div>
                <h6>Section Average</h6>
                <div className="section-average">
                  <span>No Data</span>
                </div>
                </div>
              }

            </div>
    </div>
    );
  }
}

export default GraphEmpty;
