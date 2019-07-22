import React, { Component } from 'react';
import { withRouter } from 'react-router';
import FontAwesome from 'react-fontawesome';

class FilterSelection extends Component {
  constructor(props) {
    super(props);

    this.clickHandler = this.clickHandler.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.id !== this.props.id;
  }

  getFormattedEnrollment(enrollmentConstant) {
    return Math.floor(enrollmentConstant * 100, 100);
  }

  getAverageGradeColor(averageGrade) {
    if(averageGrade.includes('A')) {
      return 'bt-green-text';
    } else if (averageGrade.includes('B')) {
      return 'bt-orange-text';
    } else {
      return 'bt-red-text';
    }
  }

  getPercentageEnrolledColor(percentageEnrolled) {
    if (percentageEnrolled <= 0.33) {
      return 'bt-green-text';
    } else if (percentageEnrolled <= 0.66) {
      return 'bt-orange-text';
    } else {
      return 'bt-red-text';
    }
  }

  getWaitlistedColor(waitlisted) {
    if (waitlisted <= 25) {
      return 'bt-green-text';
    } else if (waitlisted <= 100) {
      return 'bt-orange-text';
    } else {
      return 'bt-red-text';
    }
  }

  clickHandler() {
    let course = {
      id: this.props.id,
      abbreviation: this.props.courseAbbreviation,
      courseNumber: this.props.courseNumber
    }
    this.props.history.replace(`/catalog/${course.abbreviation}/${course.courseNumber}/details/`);
    this.props.onClick(course);
  }

  render() {
    const {courseAbbreviation, courseNumber, courseTitle, percentageEnrolled,
      units, waitlisted, averageGrade, borderColors,
      gradeColors, openSeats, id} = this.props;

    let asideDetails;
    if (this.props.sortBy === 'grade_average' || this.props.sortBy === 'department_name'
          || this.props.sortBy === 'enrolled_percentage') {
      asideDetails = (
        <div>
          {averageGrade &&
            <div className="filter-selection-average-grade">
              <h5>Average Grade</h5>
              <p className={this.getAverageGradeColor(averageGrade)}>{averageGrade}</p>
            </div>
          }
        </div>
      );
    } else if (this.props.sortBy === 'open_seats') {
      asideDetails = (
        <div>
          {openSeats &&
            <div className="filter-selection-open-seats">
              <h5>Open Seats</h5>
              <p>{openSeats}</p>
            </div>
          }
        </div>
      );
    }

    return (
        <button className="filter-selection-button" onClick={this.clickHandler}>
          <div className="filter-selection" tabIndex={id}>
            <div className="filter-selection-content">
              <h4 className="filter-selection-heading">{courseAbbreviation} {courseNumber}</h4>
              <p className="filter-selection-description">{courseTitle}</p>
              <div className="filter-selection-enrollment-data">
                <div className="dataBlock">
                  <FontAwesome className={this.getPercentageEnrolledColor(percentageEnrolled)} name={'circle'} size="xs" />
                  <p>{`${this.getFormattedEnrollment(percentageEnrolled)}% enrolled`}</p>
                </div>
                <div className="dataBlock">
                  <FontAwesome className={this.getWaitlistedColor(waitlisted)} name={'circle'} size="xs" />
                  <p>{`${waitlisted} waitlisted`}</p>
                </div>
              </div>
            </div>
            <div className="filter-selection-aside">
              <div className="filter-selection-units">
                <h6>{`${units} Unit${units !== '1.0' ? 's' : ''}`.replace(/.0/g, "").replace(/or/g, "-")}</h6>
              </div>
              {asideDetails}
            </div>
          </div>
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

const FilterSelectionWithRouter = withRouter(FilterSelection);
export default FilterSelectionWithRouter;
