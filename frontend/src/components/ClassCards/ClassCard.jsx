import React from 'react';

import vars from '../../variables/Variables';

function ClassCard (props) {
  const { id, course, title, fill, semester, faculty, removeCourse, colorId } = props;

  return (
    <div className="class-card card" style={{backgroundColor: vars.colors[colorId]}}>
      <div className="class-card content">
        <div className="class-card-upper">
          <div className="class-card course-abbreviation">
            {course}
          </div>
          <div className="class-card class-info">
            {`${semester} | ${faculty}`}
          </div>
        </div>
        <div className="class-card-lower">
          <div className="class-card class-title">
            {title}
          </div>
          <div className="delete" onClick={() => removeCourse(id, colorId)}>Remove</div>
        </div>
      </div>
    </div>
  );
}

export default ClassCard;
