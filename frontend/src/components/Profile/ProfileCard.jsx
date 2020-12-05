import React, { PureComponent } from 'react';
import { formatUnits, formatPercentage, applyIndicatorPercent, applyIndicatorGrade } from '../../utils/utils'
import Trash from '../../assets/svg/profile/trash.svg';

class ProfileCard extends PureComponent {

  render() {
    const {
      abbreviation,
      course_number,
      title,
      letter_average,
      enrolled_percentage,
      units,
      removable,
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
                : applyIndicatorPercent(formatPercentage(enrolled_percentage),enrolled_percentage)
              }

              <p>&nbsp;•&nbsp;{formatUnits(units)}</p>
            </div>
          </div>
          <div className="profile-card-sort profile-card-grade">
            {applyIndicatorGrade(letter_average,letter_average)}
          </div>
          {removable && 
            <div className="profile-card-remove">
              <img src={Trash}/>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default ProfileCard;
