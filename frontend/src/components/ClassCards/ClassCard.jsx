import React from 'react';

function ClassCard (props) {
  const { course, title, semester, faculty } = props;

  return (
    <div className="class-card card">
      <div className="class-card content">
        <div className="class-card-upper">
          <div className="class-card courseAbbreviation">
            {course}
          </div>
          <div className="class-card classInfo">
            {`${semester} | ${faculty}`}
          </div>
        </div>
        <div className="class-card-lower">
          <div className="class-card classTitle">
            {title}
          </div>
          <button type="button" className="delete" />
        </div>
      </div>
    </div>
  );
}

export default ClassCard;
