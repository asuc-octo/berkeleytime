import React from 'react';
import FilterSelection from './FilterSelection.jsx';

function FilterResults({ classesChosen }) {
  return (
    <div className="filter-results">
      <h4>Showing results for:</h4>
      {classesChosen.map((elem, idx) => (
        <FilterSelection
          id={idx}
          courseAbbreviation={elem.courseAbbreviation}
          courseTitle={elem.courseTitle}
          percentageEnrolled={elem.percentageEnrolled}
          waitlisted={elem.waitlisted}
          averageGrade={elem.averageGrade}
        />
      ))}
    </div>
  );
}

FilterResults.defaultProps = {
  classesChosen: [
    {
      courseAbbreviation: 'CS 61B',
      courseTitle: 'The Structure and Interpretation of Computer Programs',
      percentageEnrolled: 97,
      waitlisted: 120,
      units: 4,
      averageGrade: 'B',
    },
    {
      courseAbbreviation: 'Math 1A',
      courseTitle: 'Single Variable Calculus',
      percentageEnrolled: 82,
      waitlisted: 27,
      units: 4,
      averageGrade: 'B-',
    },
    {
      courseAbbreviation: 'English 43B',
      courseTitle: 'Introduction to the Art of Verse',
      percentageEnrolled: 63,
      waitlisted: 3,
      units: 3,
      averageGrade: 'A-',
    },
    {
      courseAbbreviation: 'Art 18',
      courseTitle: 'The Language of Painting',
      percentageEnrolled: 66,
      waitlisted: 0,
      units: 2,
      averageGrade: 'C',
    },

  ],
};

export default FilterResults;
