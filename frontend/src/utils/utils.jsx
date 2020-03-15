import React from 'react';

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
  if (grade[0] == 'A') {
    theme = 'bt-indicator-green';
  } else if (grade[0] == 'B') {
    theme = 'bt-indicator-yellow';
  } else if (grade[0] == 'C') {
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

export {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
};