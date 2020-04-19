/**
 * A bunch of utility functions
 */

import React from 'react';

/**
 * 
 * @param {*} text 
 * @param {*} percentage 
 */
function applyIndicatorPercent(text, percentage) {
  let theme;
  if (percentage < 0.34) {
    theme = 'bt-indicator-green';
  } else if (percentage < 0.67) {
    theme = 'bt-indicator-orange';
  } else {
    theme = 'bt-indicator-red';
  }

  return (
    <p className={theme}>{ text }</p>
  );
}

function applyIndicatorGrade(text, grade) {
  let theme;
  if (grade[0] === 'A') {
    theme = 'bt-indicator-green';
  } else if (grade[0] === 'B') {
    theme = 'bt-indicator-yellow';
  } else if (grade[0] === 'C') {
    theme = 'bt-indicator-orange';
  } else {
    theme = 'bt-indicator-red';
  }

  return (
    <p className={theme}>{ text }</p>
  );
}

/**
 * Formats units string by removing space and '.0' decimals
 *
 * ex:  "4.0" -> "4 Units"
 *      "2.0 - 12.0" -> "2-12 Units"
 */
function formatUnits(units) {
  return `${units} Unit${units === '1.0' || units === '1' ? '' : 's'}`.replace(/.0/g, '').replace(/ - /, '-').replace(/ or /g, '-');
}

/** Accepts a percentile between 0 and 1, converts it to a string. */
function percentileToString(percentile) {
  if (percentile === 1) {
    return '100th';
  }
  if (percentile === 0) {
    return '0th';
  }
  const str = `${percentile}`.padEnd(4, '0').slice(2);
  if (str[0] === '0') {
    if (str[1] === '1') {
      return `${str[1]}st`;
    } else if (str[1] === '2') {
      return `${str[1]}nd`;
    } else if (str[1] === '3') {
      return `${str[1]}rd`;
    } else {
      return `${str[1]}th`;
    }
  } else if (str[1] === '1' && str[0] !== '1') {
    return `${str}st`;
  } else if (str[1] === '2' && str[0] !== '1') {
    return `${str}nd`;
  } else if (str[1] === '3' && str[0] !== '1') {
    return `${str}rd`;
  } else {
    return `${str}th`;
  }
}

function getGradeColor(grade) {
  if (grade.includes('A') || grade === 'P') {
    return 'bt-indicator-green';
  } else if (grade.includes('B')) {
    return 'bt-indicator-orange';
  } else {
    return 'bt-indicator-red';
  }
}


export {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
  percentileToString,
  getGradeColor,
};
