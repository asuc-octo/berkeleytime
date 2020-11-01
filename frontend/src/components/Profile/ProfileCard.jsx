import React, { PureComponent } from 'react';

class ProfileCard extends PureComponent {
  static formatEnrollmentPercentage(percentage) {
    return `${Math.floor(percentage * 100, 100)}% enrolled`;
  }

  static formatUnits(units) {
    return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`.replace(/.0/g, '').replace(/ - /, '-').replace(/ or /g, '-');
  }

  static colorEnrollment(percentage) {
    const pct = percentage * 100;
    if (pct < 33) {
      return 'enrollment-first-third';
    } else if (pct < 67) {
      return 'enrollment-second-third';
    } else {
      return 'enrollment-last-third';
    }
  }

  static colorGrade(grade) {
    if (grade === '') {
      console.error('colorGrade: no grade provided!');
      return '';
    }
    return `grade-${grade[0]}`;
  }

  render() {
    const {
      abbreviation,
      course_number,
      title,
      letter_average,
      enrolled_percentage,
      units,
    } = this.props;

    return (
      <div className="profile-card">
        <div className="profile-card-container">
          <div className="profile-card-info">
            <h6>{`${abbreviation} ${course_number}`}</h6>
            <p className="profile-card-info-desc">{title}</p>
            <div className="profile-card-info-stats">
              { enrolled_percentage === -1
                ? null
                : <p className={ProfileCard.colorEnrollment(enrolled_percentage)}>{ProfileCard.formatEnrollmentPercentage(enrolled_percentage)}</p>
              }

              <p>&nbsp;•&nbsp;{ProfileCard.formatUnits(units)}</p>
            </div>
          </div>
          <div className="profile-card-sort profile-card-grade">
            <h6 className={ProfileCard.colorGrade(letter_average)}>{letter_average}</h6>
          </div>
        </div>
      </div>
    );
  }
}

export default ProfileCard;