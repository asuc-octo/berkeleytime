import React, { Component } from 'react';

class FilterSelection extends Component {
  constructor(props) {
    super(props);

    this.clickHandler = this.clickHandler.bind(this);
  }

  getFormattedEnrollment(enrollmentConstant) {
    return Math.floor(enrollmentConstant * 100, 100);
  }

  getCorrectDisplayConstant() {

  }

  getCorrectDisplayColor() {

  }

  clickHandler() {
    let course = {
      id: this.props.id,
      abbreviation: this.props.courseAbbreviation,
      courseNumber: this.props.courseNumber
    }
    this.props.onClick(course);
  }

  render() {
    const {courseAbbreviation, courseNumber, courseTitle, percentageEnrolled,
      units, waitlisted, averageGrade, borderColors,
      gradeColors, id} = this.props

    return (
        <button className={`filter-selection ${borderColors[id % 4]}`} onClick={this.clickHandler}>
          <div className="filter-selection-content">
            <h4 className="filter-selection-heading">{courseAbbreviation} {courseNumber}</h4>
            <p className="filter-selection-description">{courseTitle}</p>
            <div className="filter-selection-enrollment-data">
              <div className="dataBlock">
                <i className="fa fa-circle first" />
                <p>{` ${this.getFormattedEnrollment(percentageEnrolled)}% enrolled`}</p>
              </div>
              <div className="dataBlock">
                <i className="fa fa-circle second" />
                <p>{` ${waitlisted} waitlisted`}</p>
              </div>
            </div>
          </div>
          <div className="filter-selection-aside">
            <div className="filter-selection-units">
              <h6>{`${units} Units`}</h6>
            </div>
            {averageGrade &&
              <div className="filter-selection-average-grade ">
                <h5>Average Grade</h5>
                <p className={'bt-red-text'}>{averageGrade}</p>
              </div>
            }
          </div>
          <div className="vertical-line" />
        </button>
    );
  }
}

FilterSelection.defaultProps = {
  borderColors: ['bt-blue-border', 'bt-green-border', 'bt-pink-border', 'bt-yellow-border'],
  gradeColors: {
    A: 'bt-green-text',
    B: 'bt-orange-text',
  },
};

export default FilterSelection;
