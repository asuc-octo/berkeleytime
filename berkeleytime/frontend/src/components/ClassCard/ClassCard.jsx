import React from 'react';

function ClassCard({
  classNum,
  semester,
  faculty,
  title
}) {
  return (
    <div className="card card-class">
      <div className="content">
        <div className="columns">
          <div className="classNum column">
            {classNum}
          </div>
          <div className="classInfo column">
            {semester}
            <br />
            {faculty}
          </div>
        </div>
        <div className="columns">
          <div className="classTitle column is-three-quarters">
            {title}
          </div>
          <div className="column">
            <a className="delete" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClassCard;
