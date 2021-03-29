import React, { PureComponent } from "react";
import BookmarkSaved from "../../assets/svg/catalog/bookmark-saved.svg";
import BookmarkUnsaved from "../../assets/svg/catalog/bookmark-unsaved.svg";

class FilterCard extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      saved: false,
    };
  }
  static formatEnrollmentPercentage(percentage) {
    return `${Math.floor(percentage * 100, 100)}% enrolled`;
  }

  static formatUnits(units) {
    return `${units} Unit${units === "1.0" || units === "1" ? "" : "s"}`
      .replace(/.0/g, "")
      .replace(/ - /, "-")
      .replace(/ or /g, "-");
  }

  static colorEnrollment(percentage) {
    const pct = percentage * 100;
    if (pct < 33) {
      return "enrollment-first-third";
    } else if (pct < 67) {
      return "enrollment-second-third";
    } else {
      return "enrollment-last-third";
    }
  }

  static colorGrade(grade) {
    if (grade === "") {
      console.error("colorGrade: no grade provided!");
      return "";
    }
    return `grade-${grade[0]}`;
  }

  static gradeSort(grade) {
    return (
      <div className="filter-card-sort filter-card-grade">
        <h6 className={FilterCard.colorGrade(grade)}>{grade}</h6>
      </div>
    );
  }

  static openSeatsSort(open_seats) {
    return (
      <div className="filter-card-sort filter-card-open-seats">
        <h6>{open_seats}</h6>
      </div>
    );
  }

  clickHandler = () => {
    const { data, index } = this.props;
    const course = data.courses[index];
    this.props.data.selectCourse(course);
  };

  saveHandler = () => {
    this.setState((state) => ({
      saved: !state.saved,
    }));
  };

  render() {
    const { saved } = this.state;
    const { data, index, style } = this.props;
    const { courses, sortBy, selectedCourseId } = data;
    const course = courses[index];
    const {
      abbreviation,
      course_number,
      title,
      letter_average,
      enrolled_percentage,
      open_seats,
      units,
      id,
    } = course;

    let sort;
    switch (sortBy) {
      case "department_name":
      case "enrollment_percentage":
      case "average_grade":
        if (letter_average !== null) {
          sort = FilterCard.gradeSort(letter_average);
        } else {
          sort = null;
        }
        break;
      case "open_seats":
        sort = FilterCard.openSeatsSort(open_seats);
        break;
      default:
        sort = null;
    }

    return (
      <div style={style} className="filter-card" onClick={this.clickHandler}>
        <div
          className={`filter-card-container ${
            id === selectedCourseId ? "selected" : ""
          }`}
        >
          <div className="filter-card-info">
            <h6>{`${abbreviation} ${course_number}`}</h6>
            <p className="filter-card-info-desc">{title}</p>
            <div className="filter-card-info-stats">
              {enrolled_percentage === -1 ? (
                <p> N/A </p>
              ) : (
                <p className={FilterCard.colorEnrollment(0)}>
                  {FilterCard.formatEnrollmentPercentage(0)}
                </p>
              )}

              <p>&nbsp;•&nbsp;{FilterCard.formatUnits(units)}</p>
            </div>
          </div>
          {sort}
          {/*<div className="filter-card-save" onClick={this.saveHandler}>
            <img src={saved ? BookmarkSaved : BookmarkUnsaved}/>
          </div>*/}
        </div>
      </div>
    );
  }
}

export default FilterCard;
