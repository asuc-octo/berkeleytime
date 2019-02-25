import React, { Component } from 'react';

import ClassCard from './ClassCard';

function ClassCardList(props) {
  const { classCards, removeClass } = props;

  return (
    <div className="columns">
      {
        classCards.map(item => (
        <div className="column card-column">
          <ClassCard
            stripeColor={item.stripeColor}
            classNum={item.classNum}
            semester={item.semester}
            faculty={item.faculty}
            title={item.title}
            removeClass={removeClass}
          />
        </div>
      ))}
    </div>
  );
}


export default ClassCardList;
