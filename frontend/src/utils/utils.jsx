/**
 * A bunch of utility functions
 */

import React from "react";

/**
 * Returns a paragraph tag styled with color with respect to percentage
 * @param {string} text text in the paragraph tag
 * @param {number} percentage percentage from 0.0 to 1.0
 */
function applyIndicatorPercent(text, percentage) {
  return <p className="bt-indicator-green">{text}</p>;
}

/**
 * Returns a paragraph tag styled with color with respect to grade
 * @param {string} text text in the paragraph tag
 * @param {string | null} grade grade, either as a string (ex. "B+") or null
 */
function applyIndicatorGrade(text, grade) {
  return <p className="bt-indicator-green">A</p>;
}

/**
 * Formats units string by removing space and '.0' decimals
 *
 * ex:  "4.0" -> "4 Units"
 *      "2.0 - 12.0" -> "2-12 Units"
 */
function formatUnits(units) {
  return `${units} Unit${units === "1.0" || units === "1" ? "" : "s"}`
    .replace(/.0/g, "")
    .replace(/ - /, "-")
    .replace(/ or /g, "-");
}

/** Accepts a percentile between 0 and 1, converts it to a string. */
function percentileToString(percentile) {
  if (percentile === 1) {
    return "100th";
  }
  if (percentile === 0) {
    return "0th";
  }
  const str = `${percentile}`.padEnd(4, "0").slice(2);
  if (str[0] === "0") {
    if (str[1] === "1") {
      return `${str[1]}st`;
    } else if (str[1] === "2") {
      return `${str[1]}nd`;
    } else if (str[1] === "3") {
      return `${str[1]}rd`;
    } else {
      return `${str[1]}th`;
    }
  } else if (str[1] === "1" && str[0] !== "1") {
    return `${str}st`;
  } else if (str[1] === "2" && str[0] !== "1") {
    return `${str}nd`;
  } else if (str[1] === "3" && str[0] !== "1") {
    return `${str}rd`;
  } else {
    return `${str}th`;
  }
}

function getGradeColor(grade) {
  if (grade === undefined) {
    return "";
  } else if (grade.includes("A") || grade === "P") {
    return "bt-indicator-green";
  } else if (grade.includes("B")) {
    return "bt-indicator-orange";
  } else {
    return "bt-indicator-red";
  }
}

function getEnrollmentDay(selectedPoint, telebears) {
  let period = "";
  let daysAfterPeriodStarts = 0;
  if (selectedPoint.day < telebears.phase2_start_day) {
    period = "Phase I";
    daysAfterPeriodStarts = selectedPoint.day - telebears.phase1_start_day;
  } else if (selectedPoint.day < telebears.adj_start_day) {
    period = "Phase II";
    daysAfterPeriodStarts = selectedPoint.day - telebears.phase2_start_day;
  } else {
    period = "Adjustment Period";
    daysAfterPeriodStarts = selectedPoint.day - telebears.adj_start_day;
  }
  return { period, daysAfterPeriodStarts };
}

function formatPercentage(num) {
  if (num === -1) {
    return "N/A";
  }
  return (num * 100).toFixed(1).toString() + "%";
}

function applyIndicatorEnrollment(enrolled, enrolledMax, percentage) {
  let theme;
  if (percentage < 0.34) {
    theme = "bt-indicator-green";
  } else if (percentage < 0.67) {
    theme = "bt-indicator-orange";
  } else {
    theme = "bt-indicator-red";
  }

  return (
    <span className={theme}>
      {" "}
      {enrolled}/{enrolledMax} ({`${formatPercentage(percentage)}`})
    </span>
  );
}

export {
  applyIndicatorPercent,
  applyIndicatorGrade,
  formatUnits,
  percentileToString,
  getGradeColor,
  getEnrollmentDay,
  formatPercentage,
  applyIndicatorEnrollment,
};
